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
    public class TVShowFavoritesTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        /*
        [Fact]
        public async Task AddTVShowToFavorites_AddGameOfThrones_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1399, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(1);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task AddTVShowToFavorites_AddBreakingBad_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1396, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(1);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task AddTVShowToFavorites_AddTheSopranos_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1398, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(1);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task AddTVShowToFavorites_InvalidMediaId_ReturnsNotFound()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 999999999, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(34);
            result.Success.Should().BeFalse();
        }

        [Fact]
        public async Task RemoveTVShowFromFavorites_RemoveTheSopranos_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1398, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task RemoveTVShowFromFavorites_RemoveGameOfThrones_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1399, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task RemoveTVShowFromFavorites_RemoveBreakingBad_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1396, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }
        */
    }
}
