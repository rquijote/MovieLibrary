using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TvShowListsController(ITVShowListsClient tvShowListsClient) : ControllerBase
    {
        private readonly ITVShowListsClient _tvShowListsClient = tvShowListsClient;

        [HttpGet("airing-today")]
        public async Task<IActionResult> GetAiringToday([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetAiringTodayTVShowsAsync(page);
            return Ok(result);
        }

        [HttpGet("on-the-air")]
        public async Task<IActionResult> GetOnTheAir([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetOnTheAirTVShowsAsync(page);
            return Ok(result);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetPopularTVShowsAsync(page);
            return Ok(result);
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetTopRatedTVShowsAsync(page);
            return Ok(result);
        }
    }
}
