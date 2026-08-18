using Application.Interfaces;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiscoverController(IDiscoverMoviesClient discoverMoviesClient, IDiscoverTVShowsClient discoverTVShowsClient) : ControllerBase
    {
        private readonly IDiscoverMoviesClient _discoverMoviesClient = discoverMoviesClient;
        private readonly IDiscoverTVShowsClient _discoverTVShowsClient = discoverTVShowsClient;

        [HttpGet("movies")]
        public async Task<IActionResult> DiscoverMovies([FromQuery] DiscoverMoviesRequestDto request)
        {
            var result = await _discoverMoviesClient.DiscoverMoviesAsync(request);
            return Ok(result);
        }

        [HttpGet("tv")]
        public async Task<IActionResult> DiscoverTVShows([FromQuery] DiscoverTVShowsRequestDto request)
        {
            var result = await _discoverTVShowsClient.DiscoverTVShowsAsync(request);
            return Ok(result);
        }
    }
}
