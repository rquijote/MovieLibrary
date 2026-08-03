using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TvController : ControllerBase
    {
        [HttpGet("airing-today")]
        public async Task<IActionResult> GetAiringToday()
        {
            throw new NotImplementedException();
        }

        [HttpGet("on-the-air")]
        public async Task<IActionResult> GetOnTheAir()
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTvShowById(int id)
        {
            throw new NotImplementedException();
        }
    }
}
