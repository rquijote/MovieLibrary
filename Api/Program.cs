using Api.Services;
using Application.Interfaces;
using DotNetEnv;
using System.Net.Http.Headers;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<TrustedFrontendOrigins>();
builder.Logging.AddFilter("Microsoft.AspNetCore.Hosting.Diagnostics", LogLevel.Warning);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CurrentTmdbUser>();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = "MovieLibrary.Csrf";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
});
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
{
    options.Cookie.Name = "MovieLibrary.Auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = false;
    options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; };
    options.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = 403; return Task.CompletedTask; };
    options.Events.OnValidatePrincipal = async context =>
    {
        if (HttpMethods.IsPost(context.Request.Method)
            && string.Equals(context.Request.Path.Value?.TrimEnd('/'), "/api/Auth/logout", StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            var session = context.Principal?.FindFirstValue(CurrentTmdbUser.SessionClaim);
            if (session is null)
                throw new HttpRequestException("Missing session.");
            var account = await context.HttpContext.RequestServices.GetRequiredService<TmdbAuthClient>().GetAccount(session);
            if (account.Id.ToString() != context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier))
                throw new HttpRequestException("Account changed.");
        }
        catch (Exception ex) when (ex is HttpRequestException or System.Text.Json.JsonException or KeyNotFoundException
            or TaskCanceledException or InvalidOperationException or FormatException)
        {
            context.RejectPrincipal();
            await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }
    };
});
builder.Services.AddAuthorization();
builder.Services.AddHttpClient<TmdbAuthClient>((provider, client) =>
{
    client.BaseAddress = new Uri("https://api.themoviedb.org/3/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", provider.GetRequiredService<IConfiguration>()["BEARER_TOKEN"] ?? "");
}).RemoveAllLoggers();

// Add services to the container.
builder.Services.AddControllers(options => options.Filters.Add<AccountSecurityFilter>());
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors();
builder.Services.AddOptions<Microsoft.AspNetCore.Cors.Infrastructure.CorsOptions>().Configure<TrustedFrontendOrigins>((options, frontendOrigins) =>
{
    options.AddPolicy("AllowReactFrontend", policy =>
    {
        policy.WithOrigins(frontendOrigins.AllowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod().AllowCredentials();
    });
});

// Register TMDB API clients with configured HttpClient
var tmdbBaseUrl = "https://api.themoviedb.org/3/";

// SearchClient - for searching movies and TV shows
builder.Services.AddHttpClient<ISearchClient, SearchClient>(
    (serviceProvider, client) => 
    {
        var config = serviceProvider.GetRequiredService<IConfiguration>();
        var bearerTokenValue = config["BEARER_TOKEN"] ?? "";
        client.BaseAddress = new Uri($"{tmdbBaseUrl}search/");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
    }
);

builder.Services.AddHttpClient<IPersonClient, PersonClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri($"{tmdbBaseUrl}person/");
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", config["BEARER_TOKEN"] ?? "");
});

builder.Services.AddHttpClient<ICollectionClient, CollectionClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri($"{tmdbBaseUrl}collection/");
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", config["BEARER_TOKEN"] ?? "");
});

// TrendingClient - for trending movies and TV shows
builder.Services.AddHttpClient<ITrendingClient, TrendingClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}trending/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
});

// MovieListsClient - for movie lists (now playing, popular, top rated, upcoming)
builder.Services.AddHttpClient<IMovieListsClient, MovieListsClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}movie/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
});

// TVShowListsClient - for TV show lists (airing today, on the air, popular, top rated)
builder.Services.AddHttpClient<ITVShowListsClient, TVShowListsClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}tv/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
});

// AccountClient - for favorites and watchlist
builder.Services.AddHttpClient<IAccountClient, AccountClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}account/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
}).RemoveAllLoggers();

// MovieClient - for only a single movie
builder.Services.AddHttpClient<IMovieClient, MovieClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}movie/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
}).RemoveAllLoggers();

// TvShowClient - for only a single tv show
builder.Services.AddHttpClient<ITvShowClient, TvShowClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}tv/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
}).RemoveAllLoggers();

// DiscoverMoviesClient - for discovering movies with advanced filters
builder.Services.AddHttpClient<IDiscoverMoviesClient, DiscoverMoviesClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
});

// DiscoverTVShowsClient - for discovering TV shows with advanced filters
builder.Services.AddHttpClient<IDiscoverTVShowsClient, DiscoverTVShowsClient>((serviceProvider, client) =>
{
    var config = serviceProvider.GetRequiredService<IConfiguration>();
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
});

builder.Services.AddSingleton(serviceProvider =>
    new MySqlConnector.MySqlDataSourceBuilder(
        serviceProvider.GetRequiredService<IConfiguration>().GetConnectionString("MovieLibrary")
        ?? throw new InvalidOperationException("Local list storage is not configured.")).Build());
builder.Services.AddScoped<MySqlListsClient>();
builder.Services.AddScoped<IListsClient>(serviceProvider => serviceProvider.GetRequiredService<MySqlListsClient>());
builder.Services.AddScoped<LocalListsFilter>();

var app = builder.Build();

if (args.Contains("--migrate-list-metadata", StringComparer.Ordinal))
{
    await using var scope = app.Services.CreateAsyncScope();
    await ListMetadataMigration.Run(scope.ServiceProvider.GetRequiredService<MySqlConnector.MySqlDataSource>());
    return;
}

if (args.Contains("--migrate-list-owners", StringComparer.Ordinal))
{
    await using var scope = app.Services.CreateAsyncScope();
    await ListOwnershipMigration.Run(scope.ServiceProvider.GetRequiredService<MySqlConnector.MySqlDataSource>(),
        scope.ServiceProvider.GetRequiredService<IConfiguration>());
    return;
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactFrontend");

app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/Auth", StringComparison.OrdinalIgnoreCase))
        context.Response.Headers.CacheControl = "no-store";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    try { await next(); }
    catch (UnauthorizedAccessException)
    {
        context.Response.StatusCode = 401;
    }
    catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
    {
        context.Response.StatusCode = 502;
        await context.Response.WriteAsJsonAsync(new { error = "TMDB is temporarily unavailable." });
    }
});

app.MapControllers();

app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();

public partial class Program;
