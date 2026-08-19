using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController(IMovieClient movieClient) : ControllerBase
    {
        private readonly IMovieClient _movieClient = movieClient;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieById(int id)
        {
            var result = await _movieClient.GetMovieById(id);
            return Ok(result);
        }

        [HttpPost("{id}/rating")]
        public async Task<IActionResult> AddRatingMovie(int id, double rating)
        {
            var result = await _movieClient.AddRatingMovie(id, rating);
            return Ok(result);
        }

        [HttpDelete("{id}/rating")]
        public async Task<IActionResult> DeleteRatingMovie(int id)
        {
            var result = await _movieClient.DeleteRatingMovie(id);
            return Ok(result);
        }
    }
}
