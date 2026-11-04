using Dapper;
using MySqlConnector;

namespace Api.Services;

/// <summary>Adds optional tags and movie ordering without modifying existing list content.</summary>
public static class ListMetadataMigration
{
    /// <summary>Applies the additive, idempotent list metadata upgrade.</summary>
    /// <param name="dataSource">The list database using migration-capable credentials.</param>
    /// <returns>A task completed when both columns exist.</returns>
    public static async Task Run(MySqlDataSource dataSource)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        foreach (var column in new[] { "tags", "movie_order" })
        {
            var exists = await connection.ExecuteScalarAsync<int>(
                """
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'user_lists' AND column_name = @column;
                """, new { column });
            if (exists == 0)
                await connection.ExecuteAsync($"ALTER TABLE user_lists ADD COLUMN {column} JSON NULL");
        }
    }
}
