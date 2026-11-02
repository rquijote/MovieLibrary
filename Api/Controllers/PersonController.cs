using Application.Interfaces;
using Application.Models.Dto.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class PersonController(IPersonClient personClient) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPersonById(int id)
        {
            try
            {
                return Ok(await personClient.GetPersonById(id));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new StatusDto
                {
                    Success = false,
                    StatusCode = 34,
                    StatusMessage = ex.Message
                });
            }
        }
    }
}
