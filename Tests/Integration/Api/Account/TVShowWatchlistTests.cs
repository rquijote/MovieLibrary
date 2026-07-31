using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Api.Controllers.Dto.Status;

namespace Tests.Integration.Api.Account
{
    public class TVShowWatchlistTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task AddTVShowToWatchlist_AddGameOfThrones_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.tv, MediaId = 1399, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 1, Success = true });
        }

        [Fact]
        public async Task AddTVShowToWatchlist_AddBreakingBad_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.tv, MediaId = 1396, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 1, Success = true });
        }

        [Fact]
        public async Task AddTVShowToWatchlist_AddTheSopranos_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.tv, MediaId = 1398, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 1, Success = true });
        }

        [Fact]
        public async Task AddTVShowToWatchlist_InvalidMediaId_ReturnsNotFound()
        {
            var request = new AddMediaDto { Media = MediaType.tv, MediaId = 999999999, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 34, Success = false });
        }

        [Fact]
        public async Task RemoveTVShowFromWatchlist_RemoveTheSopranos_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.tv, MediaId = 1398, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task RemoveTVShowFromWatchlist_RemoveGameOfThrones_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.tv, MediaId = 1399, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task RemoveTVShowFromWatchlist_RemoveBreakingBad_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.tv, MediaId = 1396, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }
    }
}
