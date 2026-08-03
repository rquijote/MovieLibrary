using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        [HttpGet("movies")]
        public async Task<IActionResult> SearchMovies([FromQuery] string query)
        {
            throw new NotImplementedException();
        }

        [HttpGet("tv")]
        public async Task<IActionResult> SearchTv([FromQuery] string query)
        {
            throw new NotImplementedException();
        }
    }
}
