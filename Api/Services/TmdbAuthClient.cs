using System.Text.Json;

namespace Api.Services;

/// <summary>Public account fields that are safe to return to the frontend.</summary>
/// <param name="Id">The TMDB account identifier.</param>
/// <param name="Username">The TMDB username.</param>
/// <param name="Name">The display name.</param>
/// <param name="AvatarPath">The optional avatar path.</param>
public sealed record TmdbAccount(int Id, string Username, string Name, string? AvatarPath);
/// <summary>A temporary login approval token retained in a protected correlation cookie.</summary>
/// <param name="Token">The TMDB approval token.</param>
/// <param name="ExpiresAt">The token expiry.</param>
public sealed record TmdbRequestToken(string Token, DateTimeOffset ExpiresAt);

/// <summary>Implements the TMDB v3 approval, session, and account lifecycle.</summary>
/// <param name="http">The server-authenticated TMDB HTTP client.</param>
public sealed class TmdbAuthClient(HttpClient http)
{
    /// <summary>Requests a temporary token for TMDB user approval.</summary>
    /// <returns>The temporary token and TMDB expiration.</returns>
    public async Task<TmdbRequestToken> CreateToken()
    {
        using var response = await http.GetAsync("authentication/token/new");
        response.EnsureSuccessStatusCode();
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;
        if (!root.GetProperty("success").GetBoolean())
            throw new HttpRequestException("TMDB login unavailable.");
        var expiry = DateTimeOffset.ParseExact(root.GetProperty("expires_at").GetString()!,
            "yyyy-MM-dd HH:mm:ss 'UTC'", System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.AssumeUniversal);
        return new(root.GetProperty("request_token").GetString()!, expiry);
    }

    /// <summary>Exchanges an approved token for a secret session.</summary>
    /// <param name="token">The approved request token.</param>
    /// <returns>The session identifier, never for frontend serialization.</returns>
    public async Task<string> CreateSession(string token)
    {
        using var response = await http.PostAsJsonAsync("authentication/session/new", new { request_token = token });
        response.EnsureSuccessStatusCode();
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return json.RootElement.GetProperty("session_id").GetString()
            ?? throw new HttpRequestException("TMDB login unavailable.");
    }

    /// <summary>Validates a session by retrieving its account from TMDB.</summary>
    /// <param name="session">The protected-ticket session identifier.</param>
    /// <returns>The public account profile.</returns>
    public async Task<TmdbAccount> GetAccount(string session)
    {
        using var response = await http.GetAsync($"account?session_id={Uri.EscapeDataString(session)}");
        response.EnsureSuccessStatusCode();
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = json.RootElement;
        var id = root.GetProperty("id").GetInt32();
        if (id <= 0)
            throw new HttpRequestException("Invalid TMDB account.");
        string? avatar = null;
        if (root.TryGetProperty("avatar", out var avatars) && avatars.TryGetProperty("tmdb", out var tmdb)
            && tmdb.TryGetProperty("avatar_path", out var path) && path.ValueKind == JsonValueKind.String)
            avatar = path.GetString();
        return new(id, root.GetProperty("username").GetString() ?? "", root.GetProperty("name").GetString() ?? "", avatar);
    }

    /// <summary>Revokes a TMDB session.</summary>
    /// <param name="session">The session identifier.</param>
    /// <returns>A task completed after TMDB confirms revocation.</returns>
    public async Task DeleteSession(string session)
    {
        using var request = new HttpRequestMessage(HttpMethod.Delete, "authentication/session")
        {
            Content = JsonContent.Create(new { session_id = session })
        };
        using var response = await http.SendAsync(request);
        response.EnsureSuccessStatusCode();
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        if (!json.RootElement.GetProperty("success").GetBoolean())
            throw new HttpRequestException("TMDB session revocation was not confirmed.");
    }
}
