using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using FluentAssertions;

namespace Tests.Integration.Smoke
{
    public class SmokeTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task Get_Health_ReturnsOk()
        {
            var actual = await _client.GetAsync("/health");
            actual.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }

}

/*
 * Notes
 * Smoke Integration Test
 * - Basic end to end test that proves the app is wired up and alive.
 * 
 * WebApplicationFactory
 * - WebApplicationFactory is a testing tool that starts the ASP.NET core app inside the test environment.
 * - It gives a test HttpClient so you can call endpoints like "/health" without manually running the app yourself.
 * 
 * Factory Pattern
 * - A pattern that provides a method for creating objects. In this case ".CreateClient()".
 */