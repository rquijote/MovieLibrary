using Application.Interfaces;
using Application.Models.Dto.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TvController(ITVShowListsClient tvShowListsClient, ITVDetailsClient tvDetailsClient) : ControllerBase
    {
        private readonly ITVShowListsClient _tvShowListsClient = tvShowListsClient;
        private readonly ITVDetailsClient _tvDetailsClient = tvDetailsClient;

        [HttpGet("airing-today")]
        public async Task<IActionResult> GetAiringToday()
        {
            var result = await _tvShowListsClient.GetAiringTodayTVShowsAsync();
            return Ok(result);
        }

        [HttpGet("on-the-air")]
        public async Task<IActionResult> GetOnTheAir()
        {
            var result = await _tvShowListsClient.GetOnTheAirTVShowsAsync();
            return Ok(result);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular()
        {
            var result = await _tvShowListsClient.GetPopularTVShowsAsync();
            return Ok(result);
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated()
        {
            var result = await _tvShowListsClient.GetTopRatedTVShowsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTvShowById(int id)
        {
            var result = await _tvDetailsClient.GetTVShowByIdAsync(id);
            if (result is StatusDto)
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}
