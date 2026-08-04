using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovieById(int id)
        {

            return Ok();
        }
    }
}
