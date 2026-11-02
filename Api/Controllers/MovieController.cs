using System.ComponentModel.DataAnnotations;
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

        /// <summary>Retrieves recommended movies.</summary>
        /// <param name="id">The source movie ID.</param>
        /// <param name="page">The requested result page.</param>
        /// <returns>A page of recommended movies.</returns>
        [HttpGet("{id}/recommendations")]
        public Task<IActionResult> GetRecommendations(int id, [FromQuery, Range(1, 500)] int page = 1)
            => GetRelatedMovies(id, false, page);

        /// <summary>Retrieves similar movies.</summary>
        /// <param name="id">The source movie ID.</param>
        /// <param name="page">The requested result page.</param>
        /// <returns>A page of similar movies.</returns>
        [HttpGet("{id}/similar")]
        public Task<IActionResult> GetSimilar(int id, [FromQuery, Range(1, 500)] int page = 1)
            => GetRelatedMovies(id, true, page);

        private async Task<IActionResult> GetRelatedMovies(int id, bool similar, int page)
        {
            try
            {
                return Ok(await _movieClient.GetRelatedMovies(id, similar, page));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new StatusDto { Success = false, StatusCode = 34, StatusMessage = ex.Message });
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
