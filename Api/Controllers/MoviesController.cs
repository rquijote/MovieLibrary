using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        [HttpGet("now-playing")]
        public async Task<IActionResult> GetNowPlaying()
        {
            throw new NotImplementedException();
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular()
        {
            throw new NotImplementedException();
        }

        [HttpGet("top-rated")]
        public async Task<IActionResult> GetTopRated()
        {
            throw new NotImplementedException();
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming()
        {
            throw new NotImplementedException();
        }
    }
}
