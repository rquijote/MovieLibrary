using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
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
            var addRequest = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 11, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite movies and verify Star Wars is there
            var getResponse = await _client.GetAsync($"/api/account/favourite/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<MovieListResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Results.Should().NotBeNull();
            favorites.Results.Should().Contain(m => m.Id == 11 && m.Title == "Star Wars");

            // Remove Star Wars from favorites
            var removeRequest = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 11, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var removeResult = await removeResponse.Content.ReadFromJsonAsync<StatusDto>();
            removeResult.Should().NotBeNull();
            removeResult!.Success.Should().BeTrue();
            removeResult.StatusCode.Should().Be(13);
        }

        [Fact]
        public async Task GetFavoriteMovies_AddTheDarkKnightCheckRemove_Successful()
        {
            // Add The Dark Knight to favorites
            var addRequest = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 155, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite movies and verify The Dark Knight is there
            var getResponse = await _client.GetAsync($"/api/account/favourite/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<MovieListResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Results.Should().NotBeNull();
            favorites.Results.Should().Contain(m => m.Id == 155 && m.Title == "The Dark Knight");

            // Remove The Dark Knight from favorites
            var removeRequest = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 155, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var removeResult = await removeResponse.Content.ReadFromJsonAsync<StatusDto>();
            removeResult.Should().NotBeNull();
            removeResult!.Success.Should().BeTrue();
            removeResult.StatusCode.Should().Be(13);
        }

        [Fact]
        public async Task GetFavoriteMovies_AddIndianaJonesCheckRemove_Successful()
        {
            // Add Indiana Jones and the Dial of Destiny to favorites
            var addRequest = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 335977, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite movies and verify Indiana Jones is there
            var getResponse = await _client.GetAsync($"/api/account/favourite/movies");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<MovieListResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Results.Should().NotBeNull();
            favorites.Results.Should().Contain(m => m.Id == 335977 && m.Title == "Indiana Jones and the Dial of Destiny");

            // Remove Indiana Jones from favorites
            var removeRequest = new AddMediaFavoriteDto { Media = MediaType.movie, MediaId = 335977, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var removeResult = await removeResponse.Content.ReadFromJsonAsync<StatusDto>();
            removeResult.Should().NotBeNull();
            removeResult!.Success.Should().BeTrue();
            removeResult.StatusCode.Should().Be(13);
        }
        }
    }
}
