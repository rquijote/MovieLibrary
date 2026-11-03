using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.Services;

/// <summary>Requires a cookie-authenticated account and matching caller identity header.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class TmdbAccountRequiredAttribute : Attribute;

/// <summary>Prevents cross-account queue replay and cross-site state changes.</summary>
/// <param name="antiforgery">The ASP.NET antiforgery service.</param>
/// <param name="frontendOrigins">The fixed trusted frontend policy.</param>
public sealed class AccountSecurityFilter(IAntiforgery antiforgery, TrustedFrontendOrigins frontendOrigins) : IAsyncAuthorizationFilter
{
    /// <inheritdoc />
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var http = context.HttpContext;
        var privateRoute = context.ActionDescriptor.EndpointMetadata.OfType<TmdbAccountRequiredAttribute>().Any();
        if (privateRoute)
        {
            http.Response.Headers.CacheControl = "no-store";
            if (http.User.Identity?.IsAuthenticated != true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }
            if (!int.TryParse(http.Request.Headers["X-TMDB-Account-Id"], out var expected)
                || !int.TryParse(http.User.FindFirstValue(ClaimTypes.NameIdentifier), out var actual)
                || expected != actual)
            {
                context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
                return;
            }
        }

        if (HttpMethods.IsGet(http.Request.Method) || HttpMethods.IsHead(http.Request.Method)
            || HttpMethods.IsOptions(http.Request.Method))
            return;

        var origin = http.Request.Headers.Origin.ToString();
        var sameOrigin = $"{http.Request.Scheme}://{http.Request.Host}";
        if (http.Request.Headers["Sec-Fetch-Site"] == "cross-site"
            || (!string.IsNullOrEmpty(origin) && !string.Equals(origin, sameOrigin, StringComparison.OrdinalIgnoreCase)
                && !frontendOrigins.IsAllowed(origin)))
        {
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            return;
        }

        try
        {
            await antiforgery.ValidateRequestAsync(http);
        }
        catch (AntiforgeryValidationException)
        {
            context.Result = new BadRequestObjectResult(new { error = "Invalid CSRF token. Refresh the session." });
        }
    }
}
