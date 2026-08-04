using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController(IMovieDetailsClient movieDetailsClient) : ControllerBase
    {
        private readonly IMovieDetailsClient _movieDetailsClient = movieDetailsClient;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieById(int id)
        {
            var result = await _movieDetailsClient.GetMovieByIdAsync(id);
            return Ok(result);
        }
    }
}
