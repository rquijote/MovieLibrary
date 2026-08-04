using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    public class TVShowWatchlistTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task AddTVShowToWatchlist_AddGameOfThrones_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1399, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
        }

        [Fact]
        public async Task AddTVShowToWatchlist_AddBreakingBad_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1396, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
        }

        [Fact]
        public async Task AddTVShowToWatchlist_AddTheSopranos_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1398, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
        }

        [Fact]
        public async Task AddTVShowToWatchlist_InvalidMediaId_ReturnsNotFound()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 999999999, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeFalse();
            result.StatusCode.Should().Be(34);
        }

        [Fact]
        public async Task RemoveTVShowFromWatchlist_RemoveTheSopranos_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1398, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
        }

        [Fact]
        public async Task RemoveTVShowFromWatchlist_RemoveGameOfThrones_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1399, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
        }

        [Fact]
        public async Task RemoveTVShowFromWatchlist_RemoveBreakingBad_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.tv, MediaId = 1396, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
        }
    }
}
