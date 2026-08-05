using Application.Interfaces;
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
    }
}
