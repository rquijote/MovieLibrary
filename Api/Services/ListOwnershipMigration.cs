using Dapper;
using MySqlConnector;

namespace Api.Services;

/// <summary>Upgrades shared legacy lists to private TMDB-account-owned lists.</summary>
public static class ListOwnershipMigration
{
    /// <summary>Adds ownership, backfills legacy rows, and prohibits unowned lists.</summary>
    /// <param name="dataSource">The list database using migration-capable credentials.</param>
    /// <param name="configuration">Configuration containing the existing legacy ACCOUNT_ID.</param>
    /// <returns>A task completed when the idempotent migration finishes.</returns>
    public static async Task Run(MySqlDataSource dataSource, IConfiguration configuration)
    {
        if (!int.TryParse(configuration["ACCOUNT_ID"], out var ownerId) || ownerId <= 0)
            throw new InvalidOperationException("Configure the legacy TMDB ACCOUNT_ID before migrating lists.");

        await using var connection = await dataSource.OpenConnectionAsync();
        var exists = await connection.ExecuteScalarAsync<int>(
            """
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'user_lists' AND column_name = 'owner_account_id';
            """);
        if (exists == 0)
            await connection.ExecuteAsync("ALTER TABLE user_lists ADD COLUMN owner_account_id INT NULL, ADD INDEX ix_user_lists_owner (owner_account_id, id)");
        await connection.ExecuteAsync("UPDATE user_lists SET owner_account_id = @ownerId WHERE owner_account_id IS NULL", new { ownerId });
        await connection.ExecuteAsync("ALTER TABLE user_lists MODIFY COLUMN owner_account_id INT NOT NULL");
    }
}
