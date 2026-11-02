using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController(ISearchClient searchClient) : ControllerBase
    {
        private readonly ISearchClient _searchClient = searchClient;

        [HttpGet("movies")]
        public async Task<IActionResult> SearchMovies([FromQuery] string query)
        {
            var result = await _searchClient.SearchMoviesAsync(query);
            return Ok(result);
        }

        [HttpGet("tv")]
        public async Task<IActionResult> SearchTv([FromQuery] string query)
        {
            var result = await _searchClient.SearchTVShowsAsync(query);
            return Ok(result);
        }

        [HttpGet("people")]
        public async Task<IActionResult> SearchPeople([FromQuery] string query)
        {
            var result = await _searchClient.SearchPeopleAsync(query);
            return Ok(result);
        }

        [HttpGet("keywords")]
        public async Task<IActionResult> SearchKeywords([FromQuery] string query)
        {
            var result = await _searchClient.SearchKeywordsAsync(query);
            return Ok(result);
        }
    }
}
