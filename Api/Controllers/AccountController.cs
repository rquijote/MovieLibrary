using Api.Controllers.Dto.Status;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly string _accountId;
        private readonly string _bearerToken;
        private readonly HttpClient _client;

        public AccountController(IConfiguration config)
        {
            _accountId = config["ACCOUNT_ID"] ?? "";
            _bearerToken = config["BEARER_TOKEN"] ?? "";
            _client = new() { BaseAddress = new Uri($"https://api.themoviedb.org/3/account/{_accountId}/") };
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _bearerToken);
        }

        [HttpPost("watchlist")]
        public async Task<IActionResult> UpdateWatchlist([FromBody] AddMediaWatchlistDto addMediaDtoRequest)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "watchlist")
            {
                Content = JsonContent.Create(addMediaDtoRequest)
            };

            var response = await _client.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            var tmdb = JsonSerializer.Deserialize<StatusDto>(body);

            return Ok(new StatusDto
            {
                Success = tmdb?.Success ?? false,
                StatusCode = tmdb?.StatusCode ?? (int)response.StatusCode,
                StatusMessage = tmdb?.StatusMessage ?? "Status Message not found."
            });
        }

        [HttpPost("favorite")]
        public async Task<IActionResult> UpdateFavourites([FromBody] AddMediaFavoriteDto addMediaDtoRequest)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "favorite")
            {
                Content = JsonContent.Create(addMediaDtoRequest)
            };

            var response = await _client.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            var tmdb = JsonSerializer.Deserialize<StatusDto>(body);

            return Ok(new StatusDto
            {
                Success = tmdb?.Success ?? false,
                StatusCode = tmdb?.StatusCode ?? (int)response.StatusCode,
                StatusMessage = tmdb?.StatusMessage ?? "Status Message not found."
            });
        }

        [HttpGet("favourite/movies")]
        public async Task<IActionResult> GetFavoriteMovies()
        {
            throw new NotImplementedException();
        }

        [HttpGet("favourite/tv")]
        public async Task<IActionResult> GetFavoriteTVShows()
        {
            throw new NotImplementedException();
        }

        [HttpGet("watchlist/movies")]
        public async Task<IActionResult> GetWatchlistMovies()
        {
            throw new NotImplementedException();
        }

        [HttpGet("watchlist/tv")]
        public async Task<IActionResult> GetWatchlistTVShows()
        {
            throw new NotImplementedException();
        }

        [HttpGet("rated/movies")]
        public async Task<IActionResult> GetRatedMovies()
        {
            throw new NotImplementedException();
        }

        [HttpGet("rated/tv")]
        public async Task<IActionResult> GetRatedTVShows()
        {
            throw new NotImplementedException();
        }
    }
}
