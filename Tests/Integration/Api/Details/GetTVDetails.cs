using Api.Controllers.Dto.MovieTV;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Api.Controllers.Dto;

namespace Tests.Integration.Api.Movies
{
    public class GetTVDetails(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task GetTvDetails_ValidId_ReturnsCorrectOutput()
        {
            int TvId = 1399;
            TVSummaryDto expected = new()
            {
                Id = 1399,
                Name = "Game of Thrones"
            };
            var request = await _client.GetAsync($"/api/tv/{TvId}");
            request.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await request.Content.ReadFromJsonAsync<TVSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTvDetails_ValidId_ReturnsCorrectOutput2()
        {
            int TvId = 68595;
            TVSummaryDto expected = new() 
            { 
                Id = TvId, 
                Name = "Planet Earth" 
            };
            var request = await _client.GetAsync($"/api/tv/{TvId}");
            request.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await request.Content.ReadFromJsonAsync<TVSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTvDetails_ValidId_ReturnsCorrectOutput3()
        {
            int TvId = 79525;
            TVSummaryDto expected = new()
            { 
                Name = "The Last Dance", 
                Id = TvId 
            };
            var request = await _client.GetAsync($"/api/tv/{TvId}");
            request.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await request.Content.ReadFromJsonAsync<TVSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTvDetails_ValidButMissingId_ReturnsNotFound()
        {
            int TvId = 999999999;
            StatusDto expected = new()
            {
                Success = false,
                StatusCode = 34
            };
            var request = await _client.GetAsync($"/api/tv/{TvId}");
            request.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var actual = await request.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTvDetails_InvalidId_ReturnsInvalidId()
        {
            string TvId = "asdf";
            StatusDto expected = new()
            {
                Success = false,
                StatusCode = 6
            };
            var request = await _client.GetAsync($"/api/tv/{TvId}");
            request.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var actual = await request.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }
    }
}
