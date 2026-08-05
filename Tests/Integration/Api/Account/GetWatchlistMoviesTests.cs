using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    public class GetWatchlistMoviesTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task GetWatchlistMovies_AddStarWarsCheckRemove_Successful()
        {
            // Add Star Wars to watchlist
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 11, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get watchlist movies and verify Star Wars is there
            var getResponse = await _client.GetAsync($"/api/account/watchlist/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var watchlist = await getResponse.Content.ReadFromJsonAsync<MovieListResponseDto>();
            watchlist.Should().NotBeNull();
            watchlist!.Results.Should().NotBeNull();
            watchlist.Results.Should().ContainSingle(m => m.Id == 11 && m.Title == "Star Wars");

            // Remove Star Wars from watchlist
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 11, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task GetWatchlistMovies_AddTheDarkKnightCheckRemove_Successful()
        {
            // Add The Dark Knight to watchlist
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get watchlist movies and verify The Dark Knight is there
            var getResponse = await _client.GetAsync($"/api/account/watchlist/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var watchlist = await getResponse.Content.ReadFromJsonAsync<MovieListResponseDto>();
            watchlist.Should().NotBeNull();
            watchlist!.Results.Should().NotBeNull();
            watchlist.Results.Should().ContainSingle(m => m.Id == 155 && m.Title == "The Dark Knight");

            // Remove The Dark Knight from watchlist
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task GetWatchlistMovies_AddIndianaJonesCheckRemove_Successful()
        {
            // Add Indiana Jones and the Dial of Destiny to watchlist
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 335977, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get watchlist movies and verify Indiana Jones is there
            var getResponse = await _client.GetAsync($"/api/account/watchlist/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var watchlist = await getResponse.Content.ReadFromJsonAsync<MovieListResponseDto>();
            watchlist.Should().NotBeNull();
            watchlist!.Results.Should().NotBeNull();
            watchlist.Results.Should().ContainSingle(m => m.Id == 335977 && m.Title == "Indiana Jones and the Dial of Destiny");

            // Remove Indiana Jones from watchlist
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 335977, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }
    }
}
