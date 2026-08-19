using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    // TODO: Uncomment when test account is configured
    public class GetWatchlistMoviesTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        /*
        [Fact]
        public async Task GetWatchlistMovies_ReturnsOk()
        {
            var response = await _client.GetAsync($"/api/account/watchlist/movies");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetWatchlistMovies_AddTheDarkKnightCheckRemove_Successful()
        {
            // Cleanup: Remove The Dark Knight if it exists
            var cleanupRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            await _client.PostAsJsonAsync($"/api/account/watchlist", cleanupRequest);

            // Add The Dark Knight to watchlist
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var addResult = await addResponse.Content.ReadFromJsonAsync<StatusDto>();
            addResult.Should().NotBeNull();
            addResult.StatusCode.Should().Be(1);
            addResult.Success.Should().BeTrue();

            // Get watchlist movies and verify The Dark Knight is there
            var getResponse = await _client.GetAsync($"/api/account/watchlist/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var watchlist = await getResponse.Content.ReadFromJsonAsync<MovieListResponseDto>();
            watchlist.Should().NotBeNull();
            watchlist.Results.Should().NotBeNull();
            watchlist.Results.Should().ContainSingle(m => m.Id == 155 && m.Title == "The Dark Knight");

            // Remove The Dark Knight from watchlist
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var removeResult = await removeResponse.Content.ReadFromJsonAsync<StatusDto>();
            removeResult.Should().NotBeNull();
            removeResult.StatusCode.Should().Be(13);
            removeResult.Success.Should().BeTrue();
        }

        [Fact]
        public async Task GetWatchlistMovies_ReturnsOk_ThirdTest()
        {
            var response = await _client.GetAsync($"/api/account/watchlist/movies");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
        */
    }
}
