using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController(IMovieListsClient movieListsClient, IMovieClient movieClient) : ControllerBase
    {
        private readonly IMovieListsClient _movieListsClient = movieListsClient;
        private readonly IMovieClient _movieClient = movieClient;

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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieById(int id)
        {
            try
            {
                var result = await _movieClient.GetMovieById(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new 
                { 
                    success = false,
                    status_code = 34,
                    status_message = ex.Message
                });
            }
        }
    }
}
