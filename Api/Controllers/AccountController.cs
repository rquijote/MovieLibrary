using Application.Models.Dto.Responses;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController(IAccountClient accountClient) : ControllerBase
    {
        private readonly IAccountClient _accountClient = accountClient;

        [HttpPost("watchlist")]
        public async Task<IActionResult> UpdateWatchlist([FromBody] AddMediaWatchlistDto addMediaDtoRequest)
        {
            var result = await _accountClient.AddToWatchlistAsync(addMediaDtoRequest);
            return Ok(result);
        }

        [HttpPost("favorite")]
        public async Task<IActionResult> UpdateFavourites([FromBody] AddMediaFavoriteDto addMediaDtoRequest)
        {
            var result = await _accountClient.AddToFavoritesAsync(addMediaDtoRequest);
            return Ok(result);
        }

        [HttpGet("favourite/movies")]
        public async Task<IActionResult> GetFavoriteMovies([FromQuery] int page = 1)
        {
            var result = await _accountClient.GetFavoriteMoviesAsync(page);
            return Ok(result);
        }

        [HttpGet("favourite/tv")]
        public async Task<IActionResult> GetFavoriteTVShows([FromQuery] int page = 1)
        {
            var result = await _accountClient.GetFavoriteTVShowsAsync(page);
            return Ok(result);
        }

        [HttpGet("watchlist/movies")]
        public async Task<IActionResult> GetWatchlistMovies([FromQuery] int page = 1)
        {
            var result = await _accountClient.GetWatchlistMoviesAsync(page);
            return Ok(result);
        }

        [HttpGet("watchlist/tv")]
        public async Task<IActionResult> GetWatchlistTVShows([FromQuery] int page = 1)
        {
            var result = await _accountClient.GetWatchlistTVShowsAsync(page);
            return Ok(result);
        }
    }
}
