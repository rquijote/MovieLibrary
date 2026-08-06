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
        public async Task GetFavoriteTVShows_ReturnsOk()
        {
            var response = await _client.GetAsync($"/api/account/favourite/tv");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetFavoriteTVShows_ReturnsOk_SecondTest()
        {
            var response = await _client.GetAsync($"/api/account/favourite/tv");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task GetFavoriteTVShows_ReturnsOk_ThirdTest()
        {
            var response = await _client.GetAsync($"/api/account/favourite/tv");
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}
