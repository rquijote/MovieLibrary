using System.Net.Http.Json;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Tests.Integration.Api.Account
{
    public class GetFavoriteTVShowsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task GetFavoriteTVShows_AddGameOfThronesCheckRemove_Successful()
        {
            // Add Game of Thrones to favorites
            var addRequest = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1399, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite TV shows and verify Game of Thrones is there
            var getResponse = await _client.GetAsync($"/api/account/favourite/tv");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Results.Should().NotBeNull();
            favorites.Results.Should().Contain(t => t.Id == 1399 && t.Name == "Game of Thrones");

            // Remove Game of Thrones from favorites
            var removeRequest = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1399, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var removeResult = await removeResponse.Content.ReadFromJsonAsync<StatusDto>();
            removeResult.Should().NotBeNull();
            removeResult!.Success.Should().BeTrue();
            removeResult.StatusCode.Should().Be(13);
        }

        [Fact]
        public async Task GetFavoriteTVShows_AddBreakingBadCheckRemove_Successful()
        {
            // Add Breaking Bad to favorites
            var addRequest = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1396, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite TV shows and verify Breaking Bad is there
            var getResponse = await _client.GetAsync($"/api/account/favourite/tv");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Results.Should().NotBeNull();
            favorites.Results.Should().Contain(t => t.Id == 1396 && t.Name == "Breaking Bad");

            // Remove Breaking Bad from favorites
            var removeRequest = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1396, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var removeResult = await removeResponse.Content.ReadFromJsonAsync<StatusDto>();
            removeResult.Should().NotBeNull();
            removeResult!.Success.Should().BeTrue();
            removeResult.StatusCode.Should().Be(13);
        }

        [Fact]
        public async Task GetFavoriteTVShows_AddTheSopranosCheckRemove_Successful()
        {
            // Add The Sopranos to favorites
            var addRequest = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1398, AddToList = true };
            var addResponse = await _client.PostAsJsonAsync($"/api/account/favorite", addRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get favorite TV shows and verify The Sopranos is there
            var getResponse = await _client.GetAsync($"/api/account/favourite/tv");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var favorites = await getResponse.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            favorites.Should().NotBeNull();
            favorites!.Results.Should().NotBeNull();
            favorites.Results.Should().Contain(t => t.Id == 1398 && t.Name == "The Sopranos");

            // Remove The Sopranos from favorites
            var removeRequest = new AddMediaFavoriteDto { Media = MediaType.tv, MediaId = 1398, AddToList = false };
            var removeResponse = await _client.PostAsJsonAsync($"/api/account/favorite", removeRequest);
            removeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var removeResult = await removeResponse.Content.ReadFromJsonAsync<StatusDto>();
            removeResult.Should().NotBeNull();
            removeResult!.Success.Should().BeTrue();
            removeResult.StatusCode.Should().Be(13);
        }
    }
}
