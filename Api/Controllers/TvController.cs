using Api.Services;
using Application.Interfaces;
using Application.Models.Dto.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TvController(ITVShowListsClient tvShowListsClient, ITvShowClient tvShowClient) : ControllerBase
    {
        private readonly ITVShowListsClient _tvShowListsClient = tvShowListsClient;
        private readonly ITvShowClient _tvShowClient = tvShowClient;

        [HttpGet("airing-today")]
        public async Task<IActionResult> GetAiringToday([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetAiringTodayTVShowsAsync(page);
            return Ok(result);
        }

        [HttpGet("on-the-air")]
        public async Task<IActionResult> GetOnTheAir([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetOnTheAirTVShowsAsync(page);
            return Ok(result);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetPopularTVShowsAsync(page);
            return Ok(result);
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated([FromQuery] int page = 1)
        {
            var result = await _tvShowListsClient.GetTopRatedTVShowsAsync(page);
            return Ok(result);
        }

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
                return NotFound(new StatusDto { Success = false, StatusCode = 34, StatusMessage = ex.Message });
            }
        }
    }
}
