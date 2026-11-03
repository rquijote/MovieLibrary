using System.Security.Claims;

namespace Api.Services;

/// <summary>Reads the current account and protected TMDB session from the authenticated request.</summary>
/// <param name="accessor">The request context accessor.</param>
public sealed class CurrentTmdbUser(IHttpContextAccessor accessor)
{
    /// <summary>The claim containing the encrypted-ticket-only TMDB session.</summary>
    public const string SessionClaim = "tmdb:session";

    /// <summary>Gets the authenticated TMDB account identifier.</summary>
    public int AccountId => int.TryParse(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) && id > 0
        ? id : throw new UnauthorizedAccessException("TMDB authentication required.");

    /// <summary>Gets the authenticated session for server-to-server requests only.</summary>
    public string SessionId => accessor.HttpContext?.User.FindFirstValue(SessionClaim)
        ?? throw new UnauthorizedAccessException("TMDB authentication required.");

    /// <summary>Gets the escaped server-to-server session query.</summary>
    public string SessionQuery => $"session_id={Uri.EscapeDataString(SessionId)}";
}
