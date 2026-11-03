using System.Security.Claims;
using Api.Services;
using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using MySqlConnector;

namespace Tests.Unit.Lists;

public sealed class ListOwnershipTests
{
    private static CurrentTmdbUser User(int accountId)
    {
        var accessor = new Mock<IHttpContextAccessor>();
        accessor.SetupGet(value => value.HttpContext).Returns(new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, accountId.ToString()), new Claim(CurrentTmdbUser.SessionClaim, "test-session")], "test"))
        });
        return new(accessor.Object);
    }

    private static MySqlListsClient Client(MySqlDataSource source, int accountId)
    {
        var movies = new Mock<IMovieClient>();
        movies.Setup(client => client.GetMovieById(It.IsAny<int>())).ReturnsAsync(new MovieDto { Id = 123, Title = "Test movie" });
        return new(source, movies.Object, User(accountId));
    }

    private static async Task<MySqlDataSource> CreateSource(bool legacy = false)
    {
        var source = new MySqlDataSourceBuilder(Environment.GetEnvironmentVariable("MOVIELIBRARY_TEST_MYSQL")!).Build();
        await using var connection = await source.OpenConnectionAsync();
        await connection.ExecuteAsync(
            """
            DROP TABLE IF EXISTS user_list_items;
            DROP TABLE IF EXISTS user_lists;
            CREATE TABLE user_lists (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description VARCHAR(2000) NOT NULL DEFAULT ''
            ) ENGINE=InnoDB;
            CREATE TABLE user_list_items (
                list_id INT NOT NULL, movie_id INT NOT NULL, movie_json JSON NOT NULL,
                added_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (list_id, movie_id),
                FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
            """);
        if (!legacy)
            await connection.ExecuteAsync("ALTER TABLE user_lists ADD COLUMN owner_account_id INT NOT NULL, ADD INDEX ix_user_lists_owner (owner_account_id, id)");
        return source;
    }

    [MySqlAvailableFact]
    public async Task GivenTwoAccounts_WhenAccessingAnotherAccountsList_AllOperationsReturnNotFound()
    {
        // Arrange
        await using var source = await CreateSource();
        var owner = Client(source, 10);
        var other = Client(source, 20);
        var created = await owner.Create(new CreateListDto { Name = "Private", Language = "en" });
        var id = created.ListId!.Value;
        await owner.AddMovie(id, 123);

        // Act / Assert
        Assert.Empty((await other.GetLists(1)).Results);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => other.Details(id));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => other.Update(id, new CreateListDto { Name = "Stolen", Language = "en" }));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => other.Delete(id));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => other.AddMovie(id, 456));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => other.RemoveMovie(id, 123));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => other.Clear(id));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => other.CheckItemStatus(id, MediaType.movie, 123));
        Assert.Single((await owner.Details(id)).Items);
        Assert.Single((await owner.GetLists(1)).Results);
    }

    [MySqlAvailableFact]
    public async Task GivenOwnedList_WhenMutatingAndReading_PreservesExistingBehavior()
    {
        // Arrange
        await using var source = await CreateSource();
        var owner = Client(source, 10);
        var created = await owner.Create(new CreateListDto { Name = "Private", Language = "en" });
        var id = created.ListId!.Value;

        // Act / Assert
        await owner.AddMovie(id, 123);
        await owner.AddMovie(id, 123);
        Assert.Single((await owner.Details(id)).Items);
        Assert.True((await owner.CheckItemStatus(id, MediaType.movie, 123)).ItemPresent);
        await owner.Update(id, new CreateListDto { Name = "Updated", Description = "Private description", Language = "en" });
        Assert.Equal("Updated", (await owner.Details(id)).Name);
        await owner.RemoveMovie(id, 123);
        Assert.Empty((await owner.Details(id)).Items);
        await owner.AddMovie(id, 123);
        await owner.Clear(id);
        Assert.Empty((await owner.Details(id)).Items);
        await owner.Delete(id);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => owner.Details(id));
    }

    [MySqlAvailableFact]
    public async Task GivenLegacySchema_WhenMigratingTwice_BackfillsOnlyLegacyOwnerAndPreservesOtherOwners()
    {
        // Arrange
        await using var source = await CreateSource(legacy: true);
        await using var connection = await source.OpenConnectionAsync();
        await connection.ExecuteAsync("INSERT INTO user_lists (name) VALUES ('Legacy')");
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["ACCOUNT_ID"] = "42" }).Build();

        // Act
        await ListOwnershipMigration.Run(source, configuration);
        var created = await Client(source, 20).Create(new CreateListDto { Name = "New owner", Language = "en" });
        await ListOwnershipMigration.Run(source, configuration);

        // Assert
        Assert.Single((await Client(source, 42).GetLists(1)).Results);
        Assert.Single((await Client(source, 20).GetLists(1)).Results);
        Assert.Equal("New owner", (await Client(source, 20).Details(created.ListId!.Value)).Name);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => Client(source, 20).Details(1));
        var nullable = await connection.ExecuteScalarAsync<string>(
            "SELECT is_nullable FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_lists' AND column_name = 'owner_account_id'");
        Assert.Equal("NO", nullable);
    }

    private sealed class MySqlAvailableFactAttribute : FactAttribute
    {
        public MySqlAvailableFactAttribute()
        {
            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("MOVIELIBRARY_TEST_MYSQL")))
                Skip = "Set MOVIELIBRARY_TEST_MYSQL to a disposable database; these tests replace its list tables.";
        }
    }
}
