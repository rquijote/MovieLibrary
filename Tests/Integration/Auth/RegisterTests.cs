using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Tests.Integration.Auth
{
    public class RegisterTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task Register_WithValidInput_ReturnsOk()
        {
            var request = new { email = "test@example.com", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/register", request);
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task Register_WithMissingEmail_ReturnsBadRequest()
        {
            var request = new { email = "", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/register", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithInvalidEmail_ReturnsBadRequest()
        {
            var request = new { email = "invalid-email", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/register", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithMissingPassword_ReturnsBadRequest()
        {
            var request = new { email = "test@example.com", password = "" };
            var response = await _client.PostAsJsonAsync("/auth/register", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithWeakPassword_ReturnsBadRequest()
        {
            var request = new { email = "test@example.com", password = "weak" };
            var response = await _client.PostAsJsonAsync("/auth/register", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Register_WithDuplicateEmail_ReturnsConflict()
        {
            var request = new { email = "duplicate@example.com", password = "Password123!" };

            // Register first time
            var firstResponse = await _client.PostAsJsonAsync("/auth/register", request);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // Try to register again with same email
            var secondResponse = await _client.PostAsJsonAsync("/auth/register", request);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }
    }
}
