using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Tests.Integration.Api.Account
{
    // TODO: Uncomment when test account is configured
    public class GetFavoriteMoviesTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        /*
        [Fact]
        public async Task GetFavoriteMovies_ReturnsOk()
        {
            var response = await _client.GetAsync($"/api/account/favourite/movies");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetFavoriteMovies_ReturnsOk_SecondTest()
        {
            var response = await _client.GetAsync($"/api/account/favourite/movies");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetFavoriteMovies_ReturnsOk_ThirdTest()
        {
            var response = await _client.GetAsync($"/api/account/favourite/movies");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
        */
    }
}
