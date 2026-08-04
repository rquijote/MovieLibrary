using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController(IMovieListsClient movieListsClient) : ControllerBase
    {
        private readonly IMovieListsClient _movieListsClient = movieListsClient;

        [HttpGet("now-playing")]
        public async Task<IActionResult> GetNowPlaying()
        {
            var result = await _movieListsClient.GetNowPlayingMoviesAsync();
            return Ok(result);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular()
        {
            var result = await _movieListsClient.GetPopularMoviesAsync();
            return Ok(result);
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated()
        {
            var result = await _movieListsClient.GetTopRatedMoviesAsync();
            return Ok(result);
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming()
        {
            var result = await _movieListsClient.GetUpcomingMoviesAsync();
            return Ok(result);
        }
    }
}
