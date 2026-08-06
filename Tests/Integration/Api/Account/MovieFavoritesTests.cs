using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    public class MovieFavoritesTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task AddMovieToFavorites_AddStarWars_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 11, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(1);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task AddMovieToFavorites_AddIndianaJonesAndTheDialOfDestiny_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 335977, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(1);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task AddMovieToFavorites_AddTheDarkKnight_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 155, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(1);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task AddMovieToFavorites_InvalidMediaId_ReturnsNotFound()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 999999999, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result.StatusCode.Should().Be(34);
            result.Success.Should().BeFalse();
        }

        [Fact]
        public async Task RemoveMovieFromFavorites_RemoveStarWars_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 11, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task RemoveMovieFromFavorites_RemoveIndianaJonesAndTheDialOfDestiny_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 335977, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }

        [Fact]
        public async Task RemoveMovieFromFavorites_RemoveTheDarkKnight_Successful()
        {
            var request = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            result.Should().NotBeNull();
            result!.StatusCode.Should().Be(13);
            result.Success.Should().BeTrue();
        }
    }
}
