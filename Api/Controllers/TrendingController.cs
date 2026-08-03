using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrendingController : ControllerBase
    {
        [HttpGet("movies")]
        public async Task<IActionResult> GetTrendingMovies()
        {
            throw new NotImplementedException();
        }

        [HttpGet("tv")]
        public async Task<IActionResult> GetTrendingTv()
        {
            throw new NotImplementedException();
        }
    }
}
