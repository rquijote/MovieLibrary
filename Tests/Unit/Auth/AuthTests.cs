using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tests.Unit.Auth;

public sealed class AuthTests
{
    private static WebApplicationFactory<Program> CreateFactory(TmdbHandler handler, string? frontendOrigin = "http://localhost:5173",
        string? callbackUrl = "https://localhost/api/Auth/callback") =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["BEARER_TOKEN"] = "test-api-key",
                ["ConnectionStrings:MovieLibrary"] = null,
                ["FRONTEND_ORIGIN"] = frontendOrigin,
                ["TMDB_CALLBACK_URL"] = callbackUrl
            }));
            builder.ConfigureServices(services =>
            {
                services.AddDataProtection().UseEphemeralDataProtectionProvider();
                services.AddHttpClient<TmdbAuthClient>().ConfigurePrimaryHttpMessageHandler(() => handler);
            });
        });

    private static HttpClient CreateClient(WebApplicationFactory<Program> factory) =>
        factory.CreateClient(new() { BaseAddress = new Uri("https://localhost"), AllowAutoRedirect = false });

    private static async Task<string> GetCsrf(HttpClient client)
    {
        using var response = await client.GetAsync("/api/Auth/session");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return json.RootElement.GetProperty("csrfToken").GetString()!;
    }

    private static async Task Login(HttpClient client)
    {
        var csrf = await GetCsrf(client);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/login");
        request.Headers.Add("X-CSRF-TOKEN", csrf);
        using var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var callback = await client.GetAsync($"/api/Auth/callback?request_token=approved-token&approved=true");
        Assert.Equal("http://localhost:5173/?auth=success", callback.Headers.Location?.ToString());
    }

    [Fact]
    public async Task GivenAnonymousClient_WhenReadingSession_ReturnsCsrfWithoutSecrets()
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);

        // Act
        using var response = await client.GetAsync("/api/Auth/session");
        var body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        // Assert
        Assert.False(json.RootElement.GetProperty("authenticated").GetBoolean());
        Assert.False(string.IsNullOrEmpty(json.RootElement.GetProperty("csrfToken").GetString()));
        Assert.Equal("no-store,no-cache", response.Headers.CacheControl?.ToString()?.Replace(" ", ""));
        Assert.DoesNotContain("session_id", body);
    }

    [Theory]
    [InlineData("/api/Auth/login")]
    [InlineData("/api/Auth/complete")]
    [InlineData("/api/Auth/logout")]
    public async Task GivenMissingCsrf_WhenPostingAuth_ReturnsBadRequest(string route)
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);

        // Act
        using var response = await client.PostAsync(route, null);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GivenCrossSiteOrigin_WhenPostingLogin_ReturnsForbidden()
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);
        var csrf = await GetCsrf(client);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/login");
        request.Headers.Add("X-CSRF-TOKEN", csrf);
        request.Headers.Add("Origin", "https://evil.example");

        // Act
        using var response = await client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("approved-token", "true")]
    [InlineData("wrong-token", "true")]
    [InlineData("approved-token", "false")]
    public async Task GivenNoCorrelation_WhenCallingCallback_DoesNotCreateSession(string token, string approved)
    {
        // Arrange
        var handler = new TmdbHandler();
        await using var factory = CreateFactory(handler);
        using var client = CreateClient(factory);

        // Act
        using var response = await client.GetAsync($"/api/Auth/callback?request_token={token}&approved={approved}");

        // Assert
        Assert.Contains("auth_error=", response.Headers.Location?.ToString());
        Assert.Equal(0, handler.SessionsCreated);
    }

    [Theory]
    [InlineData("wrong-token", false)]
    [InlineData("approved-token", true)]
    public async Task GivenInvalidCorrelation_WhenCallingCallback_DoesNotCreateSession(string token, bool expired)
    {
        // Arrange
        var handler = new TmdbHandler();
        await using var factory = CreateFactory(handler);
        using var client = CreateClient(factory);
        var protector = factory.Services.GetRequiredService<IDataProtectionProvider>().CreateProtector("MovieLibrary.TmdbLogin.v1");
        var cookie = protector.Protect(JsonSerializer.Serialize(new
        {
            Token = token,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(expired ? -1 : 5)
        }));
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Auth/callback?request_token=approved-token&approved=true");
        request.Headers.Add("Cookie", $"MovieLibrary.TmdbLogin={cookie}");

        // Act
        using var response = await client.SendAsync(request);

        // Assert
        Assert.Contains("auth_error=", response.Headers.Location?.ToString());
        Assert.Equal(0, handler.SessionsCreated);
    }

    [Fact]
    public async Task GivenApprovedLogin_WhenReadingSession_ReturnsAccountWithoutSessionSecret()
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);
        await Login(client);

        // Act
        using var response = await client.GetAsync("/api/Auth/session");
        var body = await response.Content.ReadAsStringAsync();
        using var json = JsonDocument.Parse(body);

        // Assert
        Assert.True(json.RootElement.GetProperty("authenticated").GetBoolean());
        Assert.Equal(10, json.RootElement.GetProperty("account").GetProperty("id").GetInt32());
        Assert.DoesNotContain("session-secret", body);
        Assert.DoesNotContain("approved-token", body);
    }

    [Fact]
    public async Task GivenAllowedDevelopmentOrigin_WhenLoggingIn_KeepsCallbackOnInitiatingOrigin()
    {
        // Arrange
        await using var factory = CreateFactory(new(), frontendOrigin: null);
        using var client = factory.CreateClient(new() { BaseAddress = new Uri("http://127.0.0.1:5174"), AllowAutoRedirect = false });
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/login");
        request.Headers.Add("Origin", "http://127.0.0.1:5174");
        request.Headers.Add("X-CSRF-TOKEN", await GetCsrf(client));

        // Act
        using var response = await client.SendAsync(request);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var approval = json.RootElement.GetProperty("approvalUrl").GetString()!;
        using var callback = await client.GetAsync("/api/Auth/callback?request_token=approved-token&approved=true");
        using var session = await client.GetAsync("/api/Auth/session");
        using var identity = JsonDocument.Parse(await session.Content.ReadAsStringAsync());

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("redirect", json.RootElement.GetProperty("completion").GetString());
        Assert.Contains(Uri.EscapeDataString("https://localhost/api/Auth/callback"), approval);
        Assert.Equal("http://127.0.0.1:5174/?auth=success", callback.Headers.Location?.ToString());
        Assert.True(identity.RootElement.GetProperty("authenticated").GetBoolean());
    }

    [Fact]
    public async Task GivenLoopbackOriginWithoutCallbackOverride_WhenLoggingIn_CompletesWithoutLocalhostRedirect()
    {
        // Arrange
        var handler = new TmdbHandler { ApprovalPending = true };
        await using var factory = CreateFactory(handler, frontendOrigin: null, callbackUrl: null);
        using var client = factory.CreateClient(new() { BaseAddress = new Uri("http://127.0.0.1:5174"), AllowAutoRedirect = false });
        var csrf = await GetCsrf(client);
        using var login = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/login");
        login.Headers.Add("Origin", "http://127.0.0.1:5174");
        login.Headers.Add("X-CSRF-TOKEN", csrf);
        using var loginResponse = await client.SendAsync(login);
        using var json = JsonDocument.Parse(await loginResponse.Content.ReadAsStringAsync());

        // Act
        using var pending = await Complete(client, csrf);
        handler.ApprovalPending = false;
        using var completed = await Complete(client, csrf);
        using var session = await client.GetAsync("/api/Auth/session");
        using var identity = JsonDocument.Parse(await session.Content.ReadAsStringAsync());

        // Assert
        Assert.Equal("manual", json.RootElement.GetProperty("completion").GetString());
        Assert.Equal("https://www.themoviedb.org/authenticate/approved-token", json.RootElement.GetProperty("approvalUrl").GetString());
        Assert.Equal(HttpStatusCode.Conflict, pending.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, completed.StatusCode);
        Assert.True(identity.RootElement.GetProperty("authenticated").GetBoolean());
    }

    [Fact]
    public async Task GivenNoPendingLogin_WhenCompleting_DoesNotCreateSession()
    {
        // Arrange
        var handler = new TmdbHandler();
        await using var factory = CreateFactory(handler);
        using var client = CreateClient(factory);

        // Act
        using var response = await Complete(client, await GetCsrf(client));

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0, handler.SessionsCreated);
    }

    private static async Task<HttpResponseMessage> Complete(HttpClient client, string csrf)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/complete");
        request.Headers.Add("Origin", client.BaseAddress!.GetLeftPart(UriPartial.Authority));
        request.Headers.Add("X-CSRF-TOKEN", csrf);
        return await client.SendAsync(request);
    }

    [Fact]
    public async Task GivenExplicitFrontendOrigin_WhenUsingAnotherLocalOrigin_ReturnsForbidden()
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/login");
        request.Headers.Add("Origin", "http://127.0.0.1:5174");
        request.Headers.Add("X-CSRF-TOKEN", await GetCsrf(client));

        // Act
        using var response = await client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData("GET", "/api/Lists/999/details")]
    [InlineData("GET", "/api/Lists/999/item_status?media_type=movie&media_id=1")]
    [InlineData("GET", "/api/Account/lists")]
    [InlineData("GET", "/api/Movie/1/account-states")]
    [InlineData("GET", "/api/TvShow/1/account-states")]
    [InlineData("POST", "/api/Lists/999/add_movie")]
    [InlineData("DELETE", "/api/Lists/999")]
    [InlineData("POST", "/api/Movie/1/rating")]
    [InlineData("DELETE", "/api/TvShow/1/rating")]
    public async Task GivenOtherAccountQueue_WhenUsingCurrentCookie_ReturnsForbidden(string method, string route)
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);
        await Login(client);
        using var request = new HttpRequestMessage(new HttpMethod(method), route);
        request.Headers.Add("X-TMDB-Account-Id", "20");
        request.Headers.Add("X-CSRF-TOKEN", await GetCsrf(client));

        // Act
        using var response = await client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GivenMissingIdentityHeader_WhenReadingPrivateLists_ReturnsForbidden()
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);
        await Login(client);

        // Act
        using var response = await client.GetAsync("/api/Account/lists");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GivenAuthenticatedOwnerWithoutStorage_WhenReadingLists_ReturnsSanitizedUnavailable()
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);
        await Login(client);
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Account/lists");
        request.Headers.Add("X-TMDB-Account-Id", "10");

        // Act
        using var response = await client.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Contains("not configured", body);
        Assert.DoesNotContain("MySqlException", body);
    }

    [Theory]
    [InlineData("POST", "/api/Account/favorite")]
    [InlineData("POST", "/api/Lists")]
    [InlineData("POST", "/api/Movie/1/rating")]
    [InlineData("DELETE", "/api/TvShow/1/rating")]
    public async Task GivenAuthenticatedClientWithoutCsrf_WhenWriting_ReturnsBadRequest(string method, string route)
    {
        // Arrange
        await using var factory = CreateFactory(new());
        using var client = CreateClient(factory);
        await Login(client);
        using var request = new HttpRequestMessage(new HttpMethod(method), route);
        request.Headers.Add("X-TMDB-Account-Id", "10");

        // Act
        using var response = await client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GivenRevokedSession_WhenReadingSession_FailsClosed()
    {
        // Arrange
        var handler = new TmdbHandler();
        await using var factory = CreateFactory(handler);
        using var client = CreateClient(factory);
        await Login(client);
        handler.Revoked = true;

        // Act
        using var response = await client.GetAsync("/api/Auth/session");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        // Assert
        Assert.False(json.RootElement.GetProperty("authenticated").GetBoolean());
    }

    [Fact]
    public async Task GivenAuthenticatedClient_WhenLoggingOut_RevokesAndClearsCookie()
    {
        // Arrange
        var handler = new TmdbHandler();
        await using var factory = CreateFactory(handler);
        using var client = CreateClient(factory);
        await Login(client);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/logout");
        request.Headers.Add("X-CSRF-TOKEN", await GetCsrf(client));

        // Act
        using var response = await client.SendAsync(request);
        using var session = await client.GetAsync("/api/Auth/session");
        using var json = JsonDocument.Parse(await session.Content.ReadAsStringAsync());

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.True(handler.Revoked);
        Assert.False(json.RootElement.GetProperty("authenticated").GetBoolean());
    }

    [Fact]
    public async Task GivenAccountServiceOutage_WhenLoggingOut_StillRevokesRemoteSession()
    {
        // Arrange
        var handler = new TmdbHandler();
        await using var factory = CreateFactory(handler);
        using var client = CreateClient(factory);
        await Login(client);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/logout");
        request.Headers.Add("X-CSRF-TOKEN", await GetCsrf(client));
        handler.AccountUnavailable = true;

        // Act
        using var response = await client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.True(handler.Revoked);
        Assert.Equal(1, handler.DeletionAttempts);
    }

    [Fact]
    public async Task GivenRemoteRevocationFailure_WhenLoggingOut_ReturnsPartialFailureAndClearsLocalCookie()
    {
        // Arrange
        var handler = new TmdbHandler();
        await using var factory = CreateFactory(handler);
        using var client = CreateClient(factory);
        await Login(client);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/Auth/logout");
        request.Headers.Add("X-CSRF-TOKEN", await GetCsrf(client));
        handler.DeleteFails = true;

        // Act
        using var response = await client.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();
        using var session = await client.GetAsync("/api/Auth/session");
        using var identity = JsonDocument.Parse(await session.Content.ReadAsStringAsync());

        // Assert
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.Equal(1, handler.DeletionAttempts);
        Assert.False(identity.RootElement.GetProperty("authenticated").GetBoolean());
        Assert.Contains("Signed out locally", body);
        Assert.DoesNotContain("session-secret", body);
    }

    private sealed class TmdbHandler : HttpMessageHandler
    {
        public bool AccountUnavailable { get; set; }
        public bool ApprovalPending { get; set; }
        public bool DeleteFails { get; set; }
        public int DeletionAttempts { get; private set; }
        public bool Revoked { get; set; }
        public int SessionsCreated { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var path = request.RequestUri!.AbsolutePath;
            object body;
            if (path.EndsWith("/token/new"))
                body = new { success = true, request_token = "approved-token", expires_at = DateTime.UtcNow.AddMinutes(30).ToString("yyyy-MM-dd HH:mm:ss 'UTC'") };
            else if (path.EndsWith("/session/new"))
            {
                if (ApprovalPending)
                    return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Unauthorized));
                SessionsCreated++;
                body = new { success = true, session_id = "session-secret" };
            }
            else if (request.Method == HttpMethod.Delete)
            {
                DeletionAttempts++;
                if (DeleteFails)
                    return Task.FromResult(new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));
                Revoked = true;
                body = new { success = true };
            }
            else if (AccountUnavailable)
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));
            else if (Revoked)
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.Unauthorized));
            else
                body = new { id = 10, username = "test-user", name = "Test User", avatar = new { tmdb = new { avatar_path = "/avatar.png" } } };
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = JsonContent.Create(body) });
        }
    }
}
