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
        public async Task<IActionResult> GetTrendingMovies([FromQuery] string timeWindow = "day", [FromQuery] int page = 1)
        {
            var window = timeWindow == "week" ? TimeWindow.week : TimeWindow.day;
            var result = await _trendingClient.GetTrendingMoviesAsync(window, page);
            return Ok(result);
        }

        [HttpGet("tv")]
        public async Task<IActionResult> GetTrendingTv([FromQuery] string timeWindow = "day", [FromQuery] int page = 1)
        {
            var window = timeWindow == "week" ? TimeWindow.week : TimeWindow.day;
            var result = await _trendingClient.GetTrendingTVShowsAsync(window, page);
            return Ok(result);
        }
    }
}
