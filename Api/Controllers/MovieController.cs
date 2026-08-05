using Application.Interfaces;
using Application.Models.Dto.Responses;
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
            try
            {
                var result = await _movieClient.GetMovieById(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                var statusDto = new StatusDto
                {
                    Success = false,
                    StatusCode = 34,
                    StatusMessage = ex.Message
                };
                return NotFound(statusDto);
            }
        }
    }
}
