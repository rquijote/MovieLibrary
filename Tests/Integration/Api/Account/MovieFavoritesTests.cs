using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Api.Controllers.Dto.Status;

namespace Tests.Integration.Api.Account
{
    public class MovieFavoritesTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task AddMovieToFavorites_AddStarWars_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.movie, MediaId = 11, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 1, Success = true });
        }

        [Fact]
        public async Task AddMovieToFavorites_AddIndianaJonesAndTheDialOfDestiny_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.movie, MediaId = 335977, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 1, Success = true });
        }

        [Fact]
        public async Task AddMovieToFavorites_AddTheDarkKnight_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.movie, MediaId = 155, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 1, Success = true });
        }

        [Fact]
        public async Task AddMovieToFavorites_InvalidMediaId_ReturnsNotFound()
        {
            var request = new AddMediaDto { Media = MediaType.movie, MediaId = 999999999, AddToList = true };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 34, Success = false });
        }

        [Fact]
        public async Task RemoveMovieFromFavorites_RemoveStarWars_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.movie, MediaId = 11, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task RemoveMovieFromFavorites_RemoveIndianaJonesAndTheDialOfDestiny_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.movie, MediaId = 335977, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task RemoveMovieFromFavorites_RemoveTheDarkKnight_Successful()
        {
            var request = new AddMediaDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            var response = await _client.PostAsJsonAsync($"/api/account/favorite", request);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            response.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }
    }
}
