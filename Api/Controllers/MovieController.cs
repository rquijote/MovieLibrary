using Application.Interfaces;
using Application.Models.Dto.Requests;
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

        [HttpPost("{id}/rating")]
        public async Task<IActionResult> AddRatingMovie(int id, [FromBody] AddMediaRatingDto request)
        {
            var result = await _movieClient.AddRatingMovie(id, request.Value);
            return Ok(result);
        }

        [HttpDelete("{id}/rating")]
        public async Task<IActionResult> DeleteRatingMovie(int id)
        {
            var result = await _movieClient.DeleteRatingMovie(id);
            return Ok(result);
        }

        [HttpGet("{id}/account-states")]
        public async Task<IActionResult> GetAccountStateMovie(int id)
        {
            try
            {
                var result = await _movieClient.GetAccountStateMovie(id);
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
