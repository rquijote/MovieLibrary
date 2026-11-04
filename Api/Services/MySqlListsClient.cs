using System.Text.Json;
using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Dapper;
using MySqlConnector;

namespace Api.Services;

public sealed class MySqlListsClient(MySqlDataSource dataSource, IMovieClient movieClient, CurrentTmdbUser user) : IListsClient
{
    public async Task<StatusDto> Create(CreateListDto request)
    {
        Validate(request);
        await using var connection = await dataSource.OpenConnectionAsync();
        var listId = await connection.QuerySingleAsync<int>(
            """
            INSERT INTO user_lists (name, description, owner_account_id, tags, movie_order)
            VALUES (@Name, @Description, @ownerId, @tags, @movieOrder);
            SELECT LAST_INSERT_ID();
            """, new {
                Name = request.Name.Trim(), Description = request.Description ?? "", ownerId = user.AccountId,
                tags = JsonSerializer.Serialize(NormalizeTags(request.Tags)),
                movieOrder = JsonSerializer.Serialize(request.MovieOrder ?? [])
            });
        return Success(listId);
    }

    public async Task<StatusDto> Update(int listId, CreateListDto request)
    {
        Validate(request);
        await using var connection = await dataSource.OpenConnectionAsync();
        await EnsureList(connection, listId);
        await connection.ExecuteAsync(
            """
            UPDATE user_lists SET name = @Name, description = @Description,
                tags = COALESCE(@tags, tags), movie_order = COALESCE(@movieOrder, movie_order)
            WHERE id = @listId AND owner_account_id = @ownerId
            """,
            new {
                listId, Name = request.Name.Trim(), Description = request.Description ?? "", ownerId = user.AccountId,
                tags = request.Tags is null ? null : JsonSerializer.Serialize(NormalizeTags(request.Tags)),
                movieOrder = request.MovieOrder is null ? null : JsonSerializer.Serialize(request.MovieOrder)
            });
        return Success(listId);
    }

    public async Task<StatusDto> Delete(int listId)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var deleted = await connection.ExecuteAsync("DELETE FROM user_lists WHERE id = @listId AND owner_account_id = @ownerId", new { listId, ownerId = user.AccountId });
        if (deleted == 0)
            throw new KeyNotFoundException("List not found.");
        return Success(listId);
    }

    public async Task<ListDetailsDto> Details(int listId)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        using var result = await connection.QueryMultipleAsync(
            """
            SELECT id, name, description, tags AS TagsJson, movie_order AS MovieOrderJson
            FROM user_lists WHERE id = @listId AND owner_account_id = @ownerId;
            SELECT items.movie_json FROM user_list_items items
            JOIN user_lists lists ON lists.id = items.list_id
            WHERE lists.id = @listId AND lists.owner_account_id = @ownerId ORDER BY items.added_at, items.movie_id;
            """, new { listId, ownerId = user.AccountId });
        var list = await result.ReadSingleOrDefaultAsync<StoredList>()
            ?? throw new KeyNotFoundException("List not found.");
        var snapshots = await result.ReadAsync<string>();
        var movies = snapshots.Select(snapshot => JsonSerializer.Deserialize<MovieDto>(snapshot)
            ?? throw new InvalidOperationException("Invalid stored movie.")).ToList();
        var order = JsonSerializer.Deserialize<List<int>>(list.MovieOrderJson ?? "[]")
            ?? throw new InvalidOperationException("Invalid stored movie order.");
        var positions = order.Select((id, index) => (id, index)).ToDictionary(pair => pair.id, pair => pair.index);
        movies = movies.OrderBy(movie => positions.GetValueOrDefault(movie.Id, int.MaxValue)).ToList();
        return new ListDetailsDto
        {
            Id = list.Id, Name = list.Name, Description = list.Description,
            Tags = JsonSerializer.Deserialize<List<string>>(list.TagsJson ?? "[]")
                ?? throw new InvalidOperationException("Invalid stored tags."),
            MovieOrder = order, Items = movies, ItemCount = movies.Count, PosterPath = movies.FirstOrDefault()?.PosterPath
        };
    }

    public async Task<StatusDto> AddMovie(int listId, int mediaId)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(mediaId);
        await using var connection = await dataSource.OpenConnectionAsync();
        await EnsureList(connection, listId);
        var movie = await movieClient.GetMovieById(mediaId);
        await using var transaction = await connection.BeginTransactionAsync();
        await EnsureList(connection, listId, transaction);
        await connection.ExecuteAsync(
            """
            INSERT INTO user_list_items (list_id, movie_id, movie_json)
            VALUES (@listId, @mediaId, @snapshot)
            ON DUPLICATE KEY UPDATE movie_json = @snapshot;
            """, new { listId, mediaId, snapshot = JsonSerializer.Serialize(movie) }, transaction);
        await transaction.CommitAsync();
        return Success(listId);
    }

    public async Task<StatusDto> RemoveMovie(int listId, int mediaId)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(mediaId);
        await using var connection = await dataSource.OpenConnectionAsync();
        await EnsureList(connection, listId);
        await connection.ExecuteAsync(
            """
            DELETE items FROM user_list_items items JOIN user_lists lists ON lists.id = items.list_id
            WHERE lists.id = @listId AND lists.owner_account_id = @ownerId AND items.movie_id = @mediaId
            """, new { listId, mediaId, ownerId = user.AccountId });
        return Success(listId);
    }

    public async Task<StatusDto> Clear(int listId)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        await EnsureList(connection, listId);
        await connection.ExecuteAsync(
            """
            DELETE items FROM user_list_items items JOIN user_lists lists ON lists.id = items.list_id
            WHERE lists.id = @listId AND lists.owner_account_id = @ownerId
            """, new { listId, ownerId = user.AccountId });
        return Success(listId);
    }

    public async Task<ListItemStatusDto> CheckItemStatus(int listId, MediaType mediaType, int mediaId)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(mediaId);
        if (!Enum.IsDefined(mediaType))
            throw new ArgumentException("Invalid media type.");
        await using var connection = await dataSource.OpenConnectionAsync();
        await EnsureList(connection, listId);
        var present = mediaType == MediaType.movie && await connection.ExecuteScalarAsync<bool>(
            """
            SELECT EXISTS(SELECT 1 FROM user_list_items items JOIN user_lists lists ON lists.id = items.list_id
            WHERE lists.id = @listId AND lists.owner_account_id = @ownerId AND items.movie_id = @mediaId)
            """,
            new { listId, mediaId, ownerId = user.AccountId });
        return new ListItemStatusDto { Id = listId, ItemPresent = present };
    }

    public async Task<AccountListsResponseDto> GetLists(int page)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(page);
        const int pageSize = 20;
        await using var connection = await dataSource.OpenConnectionAsync();
        using var result = await connection.QueryMultipleAsync(
            """
            SELECT COUNT(*) FROM user_lists WHERE owner_account_id = @ownerId;
            SELECT lists.id, lists.name, lists.description, lists.tags AS TagsJson,
                   (SELECT COUNT(*) FROM user_list_items items WHERE items.list_id = lists.id) AS ItemCount
            FROM user_lists lists WHERE lists.owner_account_id = @ownerId ORDER BY lists.id DESC LIMIT @pageSize OFFSET @offset;
            """, new { pageSize, offset = ((long)page - 1) * pageSize, ownerId = user.AccountId });
        var count = await result.ReadSingleAsync<int>();
        var lists = (await result.ReadAsync<StoredList>()).Select(list => new AccountListSummaryDto
        {
            Id = list.Id, Name = list.Name, Description = list.Description, ItemCount = list.ItemCount,
            Tags = JsonSerializer.Deserialize<List<string>>(list.TagsJson ?? "[]")
                ?? throw new InvalidOperationException("Invalid stored tags.")
        }).ToList();
        return new AccountListsResponseDto
        {
            Page = page, Results = lists, TotalResults = count,
            TotalPages = (int)Math.Ceiling(count / (double)pageSize)
        };
    }

    private async Task EnsureList(MySqlConnection connection, int listId, MySqlTransaction? transaction = null)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(listId);
        var query = transaction is null
            ? "SELECT id FROM user_lists WHERE id = @listId AND owner_account_id = @ownerId"
            : "SELECT id FROM user_lists WHERE id = @listId AND owner_account_id = @ownerId FOR UPDATE";
        var id = await connection.QuerySingleOrDefaultAsync<int?>(query, new { listId, ownerId = user.AccountId }, transaction);
        if (id is null)
            throw new KeyNotFoundException("List not found.");
    }

    private static void Validate(CreateListDto request)
    {
        if (request.Tags is { Count: > 20 } || request.Tags?.Any(tag => string.IsNullOrWhiteSpace(tag) || tag.Trim().Length > 40) == true)
            throw new ArgumentException("Use at most 20 tags, each between 1 and 40 characters.");
        if (request.MovieOrder is not null && (request.MovieOrder.Any(id => id <= 0)
            || request.MovieOrder.Distinct().Count() != request.MovieOrder.Count))
            throw new ArgumentException("Movie order must contain unique positive movie IDs.");
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 200)
            throw new ArgumentException("List names must contain between 1 and 200 characters.");
        if (request.Description?.Length > 2000)
            throw new ArgumentException("List descriptions cannot exceed 2000 characters.");
    }

    private static List<string> NormalizeTags(List<string>? tags) =>
        tags?.Select(tag => tag.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? [];

    private sealed class StoredList
    {
        public int Id { get; init; }
        public string Name { get; init; } = "";
        public string Description { get; init; } = "";
        public int ItemCount { get; init; }
        public string? TagsJson { get; init; }
        public string? MovieOrderJson { get; init; }
    }

    private static StatusDto Success(int listId) => new()
    {
        Success = true, StatusCode = 1, StatusMessage = "Success.", ListId = listId
    };
}