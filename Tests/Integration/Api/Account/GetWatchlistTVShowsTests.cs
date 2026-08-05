using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
using Application.Enums;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    public class GetWatchlistTVShowsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task GetWatchlistTVShows_AddGameOfThronesCheckRemove_Successful()
        {
            // Add Game of Thrones to watchlist
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1399, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get watchlist TV shows and verify Game of Thrones is there
            var getResponse = await _client.GetAsync($"/api/account/watchlist/tv");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var watchlist = await getResponse.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            watchlist.Should().NotBeNull();
            watchlist!.Results.Should().NotBeNull();
            watchlist.Results.Should().ContainSingle(t => t.Id == 1399 && t.Name == "Game of Thrones");

            // Remove Game of Thrones from watchlist
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1399, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task GetWatchlistTVShows_AddBreakingBadCheckRemove_Successful()
        {
            // Add Breaking Bad to watchlist
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1396, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get watchlist TV shows and verify Breaking Bad is there
            var getResponse = await _client.GetAsync($"/api/account/watchlist/tv");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var watchlist = await getResponse.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            watchlist.Should().NotBeNull();
            watchlist!.Results.Should().NotBeNull();
            watchlist.Results.Should().ContainSingle(t => t.Id == 1396 && t.Name == "Breaking Bad");

            // Remove Breaking Bad from watchlist
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1396, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task GetWatchlistTVShows_AddTheSopranosCheckRemove_Successful()
        {
            // Add The Sopranos to watchlist
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1398, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get watchlist TV shows and verify The Sopranos is there
            var getResponse = await _client.GetAsync($"/api/account/watchlist/tv");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var watchlist = await getResponse.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            watchlist.Should().NotBeNull();
            watchlist!.Results.Should().NotBeNull();
            watchlist.Results.Should().ContainSingle(t => t.Id == 1398 && t.Name == "The Sopranos");

            // Remove The Sopranos from watchlist
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1398, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/watchlist", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }
    }
}
