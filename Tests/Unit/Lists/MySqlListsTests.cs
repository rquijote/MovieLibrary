using System.Net;
using System.Net.Http.Json;
using Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Moq;

namespace Tests.Unit.Lists;

public sealed class MySqlListsTests
{
    [Theory]
    [InlineData("GET", "/api/Lists/1/details")]
    [InlineData("GET", "/api/Account/lists")]
    [InlineData("POST", "/api/Lists")]
    [InlineData("PUT", "/api/Lists/1")]
    [InlineData("DELETE", "/api/Lists/1")]
    [InlineData("POST", "/api/Lists/1/add_movie")]
    public async Task GivenProduction_WhenAccessingLists_ReturnsNotFound(string method, string route)
    {
        await using var factory = CreateFactory("Production", null);
        using var client = factory.CreateClient();

        using var request = new HttpRequestMessage(new HttpMethod(method), route);
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GivenNonLoopbackClient_WhenAccessingLists_DoesNotExecuteEndpoint()
    {
        var environment = new Mock<IHostEnvironment>();
        environment.SetupGet(value => value.EnvironmentName).Returns(Environments.Development);
        var configuration = new ConfigurationBuilder().Build();
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse("203.0.113.1");
        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
        var context = new ResourceExecutingContext(actionContext, new List<IFilterMetadata>(), new List<IValueProviderFactory>());
        var filter = new LocalListsFilter(environment.Object, configuration);

        await filter.OnResourceExecutionAsync(context, () => throw new InvalidOperationException("Endpoint must not run."));

        Assert.IsType<NotFoundResult>(context.Result);
    }

    [Theory]
    [InlineData("/api/Lists/1/details")]
    [InlineData("/api/Account/lists")]
    public async Task GivenMissingConfiguration_WhenReadingLists_ReturnsUnavailable(string route)
    {
        await using var factory = CreateFactory("Development", null);
        using var client = factory.CreateClient();

        var response = await client.GetAsync(route);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Contains("not configured", await response.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GivenInvalidName_WhenCreatingList_ReturnsBadRequestWithoutDatabase(string name)
    {
        await using var factory = CreateFactory("Development", TestConnectionString);
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/Lists", new { name, description = "", language = "en" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GivenInvalidPage_WhenReadingLists_ReturnsBadRequestWithoutDatabase()
    {
        await using var factory = CreateFactory("Development", TestConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/Account/lists?page=0");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GivenUnavailableDatabase_WhenReadingLists_DoesNotExposeConnectionDetails()
    {
        await using var factory = CreateFactory("Development", TestConnectionString);
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/Account/lists");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.DoesNotContain("test-only-sentinel", body);
        Assert.DoesNotContain("MySqlException", body);
    }

    private const string TestConnectionString =
        "Server=127.0.0.1;Port=1;Database=movielibrary;User ID=test;Password=test-only-sentinel;Connection Timeout=1";

    private static WebApplicationFactory<Program> CreateFactory(string environment, string? connectionString) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment(environment);
            builder.ConfigureAppConfiguration((context, configuration) =>
                configuration.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ConnectionStrings:MovieLibrary"] = connectionString
                }));
        });
}