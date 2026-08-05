using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieListsController(IMovieListsClient movieListsClient) : ControllerBase
    {
        private readonly IMovieListsClient _movieListsClient = movieListsClient;

        [HttpGet("now-playing")]
        public async Task<IActionResult> GetNowPlaying([FromQuery] int page = 1)
        {
            var result = await _movieListsClient.GetNowPlayingMoviesAsync(page);
            return Ok(result);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular([FromQuery] int page = 1)
        {
            var result = await _movieListsClient.GetPopularMoviesAsync(page);
            return Ok(result);
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated([FromQuery] int page = 1)
        {
            var result = await _movieListsClient.GetTopRatedMoviesAsync(page);
            return Ok(result);
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming([FromQuery] int page = 1)
        {
            var result = await _movieListsClient.GetUpcomingMoviesAsync(page);
            return Ok(result);
        }
    }
}
