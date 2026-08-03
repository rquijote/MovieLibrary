using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Api.Controllers.Dto.Status;
using Application.Models.Dto.Requests;

namespace Tests.Integration.Api.Movies
{
    public class GetTVDetailsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task GetTVDetails_ValidId_ReturnsCorrectOutput()
        {
            int tvId = 1399;
            TVSummaryDto expected = new()
            {
                Id = 1399,
                Name = "Game of Thrones"
            };
            var request = await _client.GetAsync($"/api/tv/{tvId}");
            request.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await request.Content.ReadFromJsonAsync<TVSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTVDetails_ValidId_ReturnsCorrectOutput2()
        {
            int tvId = 68595;
            TVSummaryDto expected = new() 
            { 
                Id = tvId, 
                Name = "Planet Earth" 
            };
            var request = await _client.GetAsync($"/api/tv/{tvId}");
            request.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await request.Content.ReadFromJsonAsync<TVSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTVDetails_ValidId_ReturnsCorrectOutput3()
        {
            int tvId = 79525;
            TVSummaryDto expected = new()
            { 
                Name = "The Last Dance", 
                Id = tvId 
            };
            var request = await _client.GetAsync($"/api/tv/{tvId}");
            request.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await request.Content.ReadFromJsonAsync<TVSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTVDetails_ValidButMissingId_ReturnsNotFound()
        {
            int tvId = 999999999;
            StatusDto expected = new()
            {
                Success = false,
                StatusCode = 34
            };
            var request = await _client.GetAsync($"/api/tv/{tvId}");
            request.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var actual = await request.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetTVDetails_InvalidId_ReturnsInvalidId()
        {
            string tvId = "asdf";
            StatusDto expected = new()
            {
                Success = false,
                StatusCode = 6
            };
            var request = await _client.GetAsync($"/api/tv/{tvId}");
            request.StatusCode.Should().Be(HttpStatusCode.NotFound);

            var actual = await request.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }
    }
}
