using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Api.Services;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

/// <summary>Exposes browser cookie authentication backed exclusively by TMDB approval.</summary>
/// <param name="tmdb">The TMDB authentication client.</param>
/// <param name="antiforgery">The browser CSRF protection service.</param>
/// <param name="protection">The correlation-cookie data protection provider.</param>
/// <param name="configuration">Trusted authentication redirect settings.</param>
/// <param name="environment">The host environment governing cookie security.</param>
/// <param name="frontendOrigins">The configured or fixed local frontend-origin whitelist.</param>
[ApiController]
[Route("api/[controller]")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class AuthController(TmdbAuthClient tmdb, IAntiforgery antiforgery,
    IDataProtectionProvider protection, IConfiguration configuration, IHostEnvironment environment,
    TrustedFrontendOrigins frontendOrigins) : ControllerBase
{
    private const string CorrelationCookie = "MovieLibrary.TmdbLogin";
    private readonly IDataProtector _protector = protection.CreateProtector("MovieLibrary.TmdbLogin.v1");
    private sealed record Correlation(string Token, DateTimeOffset ExpiresAt, string FrontendOrigin);

    /// <summary>Returns verified public identity and a CSRF request token.</summary>
    /// <returns>A session view without TMDB credentials.</returns>
    [HttpGet("session")]
    public IActionResult Session()
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        if (User.Identity?.IsAuthenticated != true)
            return Ok(new { authenticated = false, csrfToken = tokens.RequestToken });
        var account = new TmdbAccount(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
            User.FindFirstValue(ClaimTypes.Name) ?? "", User.FindFirstValue("tmdb:name") ?? "",
            User.FindFirstValue("tmdb:avatar"));
        return Ok(new { authenticated = true, account, csrfToken = tokens.RequestToken });
    }

    /// <summary>Begins a correlated TMDB browser approval.</summary>
    /// <returns>The TMDB approval navigation URL.</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login()
    {
        try
        {
            var token = await tmdb.CreateToken();
            var expires = token.ExpiresAt < DateTimeOffset.UtcNow.AddMinutes(10)
                ? token.ExpiresAt : DateTimeOffset.UtcNow.AddMinutes(10);
            var frontendOrigin = frontendOrigins.Resolve(Request.Headers.Origin.ToString());
            Response.Cookies.Append(CorrelationCookie,
                _protector.Protect(JsonSerializer.Serialize(new Correlation(token.Token, expires, frontendOrigin))),
                CookieOptions(expires));
            var approvalUrl = $"https://www.themoviedb.org/authenticate/{Uri.EscapeDataString(token.Token)}";
            var configuredCallback = configuration["TMDB_CALLBACK_URL"];
            var callback = configuredCallback ?? $"{frontendOrigin}/api/Auth/callback";
            if (!Uri.TryCreate(callback, UriKind.Absolute, out var callbackUri)
                || (callbackUri.Scheme != "https" && !(callbackUri.Scheme == "http" && callbackUri.IsLoopback))
                || callbackUri.AbsolutePath != "/api/Auth/callback" || !string.IsNullOrEmpty(callbackUri.Query)
                || !string.IsNullOrEmpty(callbackUri.Fragment) || !string.IsNullOrEmpty(callbackUri.UserInfo))
                throw new InvalidOperationException("TMDB_CALLBACK_URL must be a trusted callback URL.");
            // TMDB's firewall rejects approvals that redirect to localhost, so local origins finish via /complete.
            if (configuredCallback is null && callbackUri.IsLoopback)
                return Ok(new { approvalUrl, completion = "manual" });
            return Ok(new { approvalUrl = $"{approvalUrl}?redirect_to={Uri.EscapeDataString(callback)}", completion = "redirect" });
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException or FormatException
            or KeyNotFoundException or TaskCanceledException or InvalidOperationException)
        {
            return StatusCode(502, new { error = "TMDB login is unavailable." });
        }
    }

    /// <summary>Completes only the browser's initiated and unexpired TMDB approval.</summary>
    /// <param name="token">The approved request token returned by TMDB.</param>
    /// <param name="approved">TMDB's approval flag.</param>
    /// <returns>A redirect to the configured frontend origin.</returns>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback([FromQuery(Name = "request_token")] string? token, [FromQuery] string? approved)
    {
        Response.Cookies.Delete(CorrelationCookie, CookieOptions(null));
        var frontendOrigin = frontendOrigins.DefaultOrigin;
        try
        {
            var cookie = Request.Cookies[CorrelationCookie];
            var correlation = cookie is null ? null : JsonSerializer.Deserialize<Correlation>(_protector.Unprotect(cookie));
            if (correlation is not null)
                frontendOrigin = frontendOrigins.Resolve(correlation.FrontendOrigin);
            if (approved != "true" || string.IsNullOrEmpty(token) || correlation is null
                || correlation.ExpiresAt <= DateTimeOffset.UtcNow
                || !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(token), Encoding.UTF8.GetBytes(correlation.Token)))
                return Redirect(FrontendUrl(true, frontendOrigin));

            await SignIn(token);
            return Redirect(FrontendUrl(false, frontendOrigin));
        }
        catch (Exception ex) when (ex is CryptographicException or JsonException or HttpRequestException
            or KeyNotFoundException or FormatException or TaskCanceledException or InvalidOperationException)
        {
            return Redirect(FrontendUrl(true, frontendOrigin));
        }
    }

    /// <summary>Completes this browser's pending TMDB approval without a redirect.</summary>
    /// <returns>No content once signed in; 409 while TMDB approval is still pending.</returns>
    [HttpPost("complete")]
    public async Task<IActionResult> Complete()
    {
        Correlation? correlation;
        try
        {
            var cookie = Request.Cookies[CorrelationCookie];
            correlation = cookie is null ? null : JsonSerializer.Deserialize<Correlation>(_protector.Unprotect(cookie));
        }
        catch (Exception ex) when (ex is CryptographicException or JsonException)
        {
            correlation = null;
        }
        if (correlation is null || correlation.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            Response.Cookies.Delete(CorrelationCookie, CookieOptions(null));
            return BadRequest(new { error = "No TMDB login is in progress. Start again." });
        }
        try
        {
            await SignIn(correlation.Token);
        }
        catch (HttpRequestException ex) when (ex.StatusCode is System.Net.HttpStatusCode.Unauthorized)
        {
            return Conflict(new { error = "TMDB has not approved this login yet." });
        }
        catch (Exception ex) when (ex is HttpRequestException or JsonException or KeyNotFoundException
            or FormatException or TaskCanceledException or InvalidOperationException)
        {
            return StatusCode(502, new { error = "TMDB login is unavailable." });
        }
        Response.Cookies.Delete(CorrelationCookie, CookieOptions(null));
        return NoContent();
    }

    private async Task SignIn(string token)
    {
        var session = await tmdb.CreateSession(token);
        var account = await tmdb.GetAccount(session);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.Id.ToString()),
            new(ClaimTypes.Name, account.Username),
            new("tmdb:name", account.Name),
            new(CurrentTmdbUser.SessionClaim, session)
        };
        if (account.AvatarPath is not null)
            claims.Add(new("tmdb:avatar", account.AvatarPath));
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
    }

    /// <summary>Clears the browser ticket and revokes its TMDB session.</summary>
    /// <returns>No content after successful logout, or a sanitized revocation error.</returns>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var session = User.FindFirstValue(CurrentTmdbUser.SessionClaim);
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        Response.Cookies.Delete(CorrelationCookie, CookieOptions(null));
        if (session is not null)
        {
            try { await tmdb.DeleteSession(session); }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException
                or KeyNotFoundException or InvalidOperationException)
            {
                return StatusCode(502, new { error = "Signed out locally; TMDB session revocation could not be confirmed." });
            }
        }
        return NoContent();
    }

    private CookieOptions CookieOptions(DateTimeOffset? expires) => new()
    {
        HttpOnly = true, Secure = Request.IsHttps || !environment.IsDevelopment(), SameSite = SameSiteMode.Lax,
        Path = "/api/Auth", Expires = expires, IsEssential = true
    };

    private string FrontendUrl(bool error, string origin) =>
        $"{frontendOrigins.Resolve(origin)}/{(error ? "?auth_error=tmdb_login_failed" : "?auth=success")}";
}
