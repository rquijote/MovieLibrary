namespace Api.Services;

/// <summary>Defines the fixed frontend origins permitted to initiate and complete authentication.</summary>
public sealed class TrustedFrontendOrigins
{
    /// <summary>Builds the configured single-origin policy or the fixed local-development whitelist.</summary>
    /// <param name="configuration">Server-side frontend configuration.</param>
    /// <param name="environment">The host environment.</param>
    public TrustedFrontendOrigins(IConfiguration configuration, IHostEnvironment environment)
    {
        var configured = configuration["FRONTEND_ORIGIN"];
        DefaultOrigin = Normalize(configured ?? "http://localhost:5173");
        AllowedOrigins = configured is null && environment.IsDevelopment()
            ? ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]
            : [DefaultOrigin];
    }

    /// <summary>Gets the fallback origin for requests with no browser Origin header.</summary>
    public string DefaultOrigin { get; }

    /// <summary>Gets the exact allowed browser origins.</summary>
    public string[] AllowedOrigins { get; }

    /// <summary>Checks an Origin header against the fixed server policy.</summary>
    /// <param name="origin">The complete browser origin.</param>
    /// <returns>Whether that origin is explicitly trusted.</returns>
    public bool IsAllowed(string origin) => AllowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase);

    /// <summary>Selects only a configured or fixed-whitelist origin.</summary>
    /// <param name="origin">A browser origin or a protected correlation origin.</param>
    /// <returns>The allowed origin, or the default when no origin was supplied.</returns>
    public string Resolve(string? origin)
    {
        if (string.IsNullOrEmpty(origin))
            return DefaultOrigin;
        if (!IsAllowed(origin))
            throw new InvalidOperationException("The frontend origin is not trusted.");
        return AllowedOrigins.First(allowed => string.Equals(allowed, origin, StringComparison.OrdinalIgnoreCase));
    }

    private static string Normalize(string configured)
    {
        if (!Uri.TryCreate(configured, UriKind.Absolute, out var uri)
            || (uri.Scheme != "https" && !(uri.Scheme == "http" && uri.IsLoopback))
            || uri.AbsolutePath != "/" || !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment)
            || !string.IsNullOrEmpty(uri.UserInfo))
            throw new InvalidOperationException("FRONTEND_ORIGIN must be a trusted origin (HTTPS except localhost).");
        return uri.GetLeftPart(UriPartial.Authority);
    }
}
