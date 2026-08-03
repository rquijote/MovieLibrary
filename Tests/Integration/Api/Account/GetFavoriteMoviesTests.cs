using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Api.Controllers.Dto.Status;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    public class GetFavoriteMoviesTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task GetFavoriteMovies_AddStarWarsCheckRemove_Successful()
        {
            // Add Star Wars to favorites
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 11, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite movies and verify Star Wars is there
            var getResponse = await _client.GetAsync($"/api/account/favorite/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<TmdbSearchResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Movies.Should().NotBeNull();
            favorites.Movies.Should().ContainSingle(m => m.Id == 11 && m.Title == "Star Wars");

            // Remove Star Wars from favorites
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 11, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task GetFavoriteMovies_AddTheDarkKnightCheckRemove_Successful()
        {
            // Add The Dark Knight to favorites
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite movies and verify The Dark Knight is there
            var getResponse = await _client.GetAsync($"/api/account/favorite/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<TmdbSearchResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Movies.Should().NotBeNull();
            favorites.Movies.Should().ContainSingle(m => m.Id == 155 && m.Title == "The Dark Knight");

            // Remove The Dark Knight from favorites
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }

        [Fact]
        public async Task GetFavoriteMovies_AddIndianaJonesCheckRemove_Successful()
        {
            // Add Indiana Jones and the Dial of Destiny to favorites
            var addRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 335977, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite movies and verify Indiana Jones is there
            var getResponse = await _client.GetAsync($"/api/account/favorite/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<TmdbSearchResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Movies.Should().NotBeNull();
            favorites.Movies.Should().ContainSingle(m => m.Id == 335977 && m.Title == "Indiana Jones and the Dial of Destiny");

            // Remove Indiana Jones from favorites
            var removeRequest = new AddMediaWatchlistDto { Media = MediaType.movie, MediaId = 335977, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            removeResponse.Content.Should().BeEquivalentTo(new StatusDto { StatusCode = 13, Success = true });
        }
    }
}
