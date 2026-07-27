using System.Net;
using System.Net.Http.Json;
using Api.Controllers.Dto;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Tests.Integration.Api
{
    public class TMDBApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        // MethodName_StateUnderTest_ExpectedBehavior
        [Fact]
        public async Task GetMovie_ValidId_ReturnsCorrectValue()
        {
            int movieId = 11;
            MovieDto expected = new() 
            { 
                Id = movieId, 
                Title = "Star Wars", 
                ReleaseDate = "1977-05-25" 
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<MovieDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovie_ValidId_ReturnsCorrectValue2()
        {
            int movieId = 12;
            MovieDto expected = new() 
            { 
                Id = movieId, 
                Title = "Finding Nemo", 
                ReleaseDate = "2003-05-30" 
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<MovieDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovie_ValidId_ReturnsCorrectValue3()
        {
            int movieId = 120;
            MovieDto expected = new() 
            { 
                Id = movieId, 
                Title = "The Lord of the Rings: The Fellowship of the Ring", 
                ReleaseDate = "2001-12-18" 
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<MovieDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovie_InvalidId_ReturnsInvalid()
        {
            int movieId = -1;
            StatusDto expected = new() 
            { 
                Success = false, 
                StatusCode = "6"
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetMovie_NonExistentId_ReturnsNotFound()
        {
            int movieId = 999999999;
            StatusDto expected = new()
            {
                Success = false,
                StatusCode = "34"
            };
            var response = await _client.GetAsync($"/api/movie/{movieId}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var actual = await response.Content.ReadFromJsonAsync<StatusDto>();
            actual.Should().NotBeNull();
            actual.Should().BeEquivalentTo(expected);
        }
    }
}
