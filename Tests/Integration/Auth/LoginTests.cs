using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Tests.Integration.Auth
{
    public class LoginTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOk()
        {
            // Arrange - First register a user
            var registerRequest = new { email = "login@example.com", password = "Password123!" };
            await _client.PostAsJsonAsync("/auth/register", registerRequest);

            // Act - Login with same credentials
            var loginRequest = new { email = "login@example.com", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task Login_WithInvalidEmail_ReturnsUnauthorized()
        {
            var request = new { email = "nonexistent@example.com", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/login", request);
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
        {
            // Arrange - Register a user
            var registerRequest = new { email = "user@example.com", password = "CorrectPassword123!" };
            await _client.PostAsJsonAsync("/auth/register", registerRequest);

            // Act - Try to login with wrong password
            var loginRequest = new { email = "user@example.com", password = "WrongPassword123!" };
            var response = await _client.PostAsJsonAsync("/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Login_WithMissingEmail_ReturnsBadRequest()
        {
            var request = new { email = "", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/login", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_WithMissingPassword_ReturnsBadRequest()
        {
            var request = new { email = "test@example.com", password = "" };
            var response = await _client.PostAsJsonAsync("/auth/login", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_WithInvalidEmailFormat_ReturnsBadRequest()
        {
            var request = new { email = "invalid-email-format", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/login", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_WithNullCredentials_ReturnsBadRequest()
        {
            var request = new { email = (string?)null, password = (string?)null };
            var response = await _client.PostAsJsonAsync("/auth/login", request);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_ReturnsTokenOnSuccess()
        {
            // Arrange - Register a user
            var registerRequest = new { email = "tokentest@example.com", password = "Password123!" };
            await _client.PostAsJsonAsync("/auth/register", registerRequest);

            // Act - Login
            var loginRequest = new { email = "tokentest@example.com", password = "Password123!" };
            var response = await _client.PostAsJsonAsync("/auth/login", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }
    }
}
