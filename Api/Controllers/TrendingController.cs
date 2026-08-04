using Application.Enums;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrendingController(ITrendingClient trendingClient) : ControllerBase
    {
        private readonly ITrendingClient _trendingClient = trendingClient;

        [HttpGet("movies")]
        public async Task<IActionResult> GetTrendingMovies()
        {
            var result = await _trendingClient.GetTrendingMoviesAsync(TimeWindow.Day);
            return Ok(result);
        }

        [HttpGet("tv")]
        public async Task<IActionResult> GetTrendingTv()
        {
            var result = await _trendingClient.GetTrendingTVShowsAsync(TimeWindow.Day);
            return Ok(result);
        }
    }
}
