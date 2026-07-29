using System.Net;
using System.Net.Http.Json;
using Api.Controllers.Dto;
using Api.Controllers.Dto.MovieTV;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Tests.Integration.Api.Details
{
    public class GetMovieDetails(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        // MethodName_StateUnderTest_ExpectedBehavior
        [Fact]
        public async Task GetMovieDetails_ValidId_ReturnsCorrectValue()
        {
            int movieId = 11;
            MovieSummaryDto expected = new() 
            { 
                Id = movieId, 
                Title = "Star Wars"
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<MovieSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovieDetails_ValidId_ReturnsCorrectValue2()
        {
            int movieId = 12;
            MovieSummaryDto expected = new() 
            { 
                Id = movieId, 
                Title = "Finding Nemo"
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<MovieSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovieDetails_ValidId_ReturnsCorrectValue3()
        {
            int movieId = 120;
            MovieSummaryDto expected = new() 
            { 
                Id = movieId, 
                Title = "The Lord of the Rings: The Fellowship of the Ring"
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<MovieSummaryDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovieDetails_InvalidId_ReturnsInvalid()
        {
            int movieId = -1;
            StatusDto expected = new() 
            { 
                Success = false, 
                StatusCode = 6
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovieDetails_NonExistentId_ReturnsNotFound()
        {
            int movieId = 999999999;
            StatusDto expected = new()
            {
                Success = false,
                StatusCode = 34
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }
    }
}
