using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    public class MovieWatchlistTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task AddMovieToWatchlist_AddStarWars_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 11, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
        }

        [Fact]
        public async Task AddMovieToWatchlist_AddIndianaJonesAndTheDialOfDestiny_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 335977, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().BeEquivalentTo(new StatusDto 
            { 
              StatusCode = 1,
              Success = true,
              StatusMessage = "Success."
            });
        }

        [Fact]
        public async Task AddMovieToWatchlist_AddTheDarkKnight_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().BeEquivalentTo(new StatusDto 
            { 
              StatusCode = 1,
              Success = true,
              StatusMessage = "Success."
            });
        }

        [Fact]
        public async Task AddMovieToWatchlist_InvalidMediaId_ReturnsNotFound()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 999999999, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(34);
            result.Success.Should().BeFalse();
        }

        [Fact]
        public async Task RemoveMovieFromWatchlist_RemoveStarWars_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 11, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task RemoveMovieFromWatchlist_RemoveIndianaJonesAndTheDialOfDestiny_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 335977, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task RemoveMovieFromWatchlist_RemoveTheDarkKnight_Successful()
        {
            var request = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/watchlist", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }
    }
}
