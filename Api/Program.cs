using Api.Services;
using Application.Interfaces;
using DotNetEnv;
using System.Net.Http.Headers;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

var bearerToken = builder.Configuration["BEARER_TOKEN"];
var accountId = builder.Configuration["ACCOUNT_ID"];

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
    var accountIdValue = config["ACCOUNT_ID"] ?? "";
    var bearerTokenValue = config["BEARER_TOKEN"] ?? "";

    client.BaseAddress = new Uri($"{tmdbBaseUrl}account/{accountIdValue}/");
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerTokenValue);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok("Healthy"));

app.Run();
