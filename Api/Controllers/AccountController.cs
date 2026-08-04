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
        public async Task<IActionResult> GetFavoriteMovies()
        {
            var result = await _accountClient.GetFavoriteMoviesAsync();
            return Ok(result);
        }

        [HttpGet("favourite/tv")]
        public async Task<IActionResult> GetFavoriteTVShows()
        {
            var result = await _accountClient.GetFavoriteTVShowsAsync();
            return Ok(result);
        }

        [HttpGet("watchlist/movies")]
        public async Task<IActionResult> GetWatchlistMovies()
        {
            var result = await _accountClient.GetWatchlistMoviesAsync();
            return Ok(result);
        }

        [HttpGet("watchlist/tv")]
        public async Task<IActionResult> GetWatchlistTVShows()
        {
            var result = await _accountClient.GetWatchlistTVShowsAsync();
            return Ok(result);
        }
    }
}
