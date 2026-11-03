using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

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
    [InlineData("GET", "/api/Lists/1/item_status?media_type=movie&media_id=1")]
    public async Task GivenAnonymousClient_WhenAccessingLists_ReturnsUnauthorized(string method, string route)
    {
        // Arrange
        await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder => builder.UseEnvironment("Production"));
        using var client = factory.CreateClient(new() { BaseAddress = new Uri("https://localhost") });

        // Act
        using var request = new HttpRequestMessage(new HttpMethod(method), route);
        using var response = await client.SendAsync(request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
