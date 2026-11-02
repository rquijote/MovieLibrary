using System.ComponentModel.DataAnnotations;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TvShowController(ITvShowClient tvShowClient) : ControllerBase
    {
        private readonly ITvShowClient _tvShowClient = tvShowClient;

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTvShowById(int id)
        {
            try
            {
                var result = await _tvShowClient.GetTvShowById(id);
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

        /// <summary>Retrieves recommended TV shows.</summary>
        /// <param name="id">The source TV show ID.</param>
        /// <param name="page">The requested result page.</param>
        /// <returns>A page of recommended TV shows.</returns>
        [HttpGet("{id}/recommendations")]
        public Task<IActionResult> GetRecommendations(int id, [FromQuery, Range(1, 500)] int page = 1)
            => GetRelatedTvShows(id, false, page);

        /// <summary>Retrieves similar TV shows.</summary>
        /// <param name="id">The source TV show ID.</param>
        /// <param name="page">The requested result page.</param>
        /// <returns>A page of similar TV shows.</returns>
        [HttpGet("{id}/similar")]
        public Task<IActionResult> GetSimilar(int id, [FromQuery, Range(1, 500)] int page = 1)
            => GetRelatedTvShows(id, true, page);

        private async Task<IActionResult> GetRelatedTvShows(int id, bool similar, int page)
        {
            try
            {
                return Ok(await _tvShowClient.GetRelatedTvShows(id, similar, page));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new StatusDto { Success = false, StatusCode = 34, StatusMessage = ex.Message });
            }
        }

        [HttpGet("{id}/season/{seasonNumber}")]
        public async Task<IActionResult> GetSeasonById(int id, int seasonNumber)
        {
            try
            {
                return Ok(await _tvShowClient.GetSeasonById(id, seasonNumber));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new StatusDto
                {
                    Success = false,
                    StatusCode = 34,
                    StatusMessage = ex.Message
                });
            }
        }

        [HttpGet("{id}/season/{seasonNumber}/episode/{episodeNumber}")]
        public async Task<IActionResult> GetEpisodeById(int id, int seasonNumber, int episodeNumber)
        {
            try
            {
                return Ok(await _tvShowClient.GetEpisodeById(id, seasonNumber, episodeNumber));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new StatusDto
                {
                    Success = false,
                    StatusCode = 34,
                    StatusMessage = ex.Message
                });
            }
        }

        [HttpPost("{id}/rating")]
        public async Task<IActionResult> AddRatingTvShow(int id, [FromBody] AddMediaRatingDto request)
        {
            try
            {
                var result = await _tvShowClient.AddRatingTvShow(id, request.Value);
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

        [HttpDelete("{id}/rating")]
        public async Task<IActionResult> DeleteRatingTvShow(int id)
        {
            try
            {
                var result = await _tvShowClient.DeleteRatingTvShow(id);
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

        [HttpGet("{id}/account-states")]
        public async Task<IActionResult> GetAccountStateTvShow(int id)
        {
            try
            {
                var result = await _tvShowClient.GetAccountStateTvShow(id);
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
