using Application.Interfaces;
using Application.Models.Dto.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class CollectionController(ICollectionClient collectionClient) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCollectionById(int id)
        {
            try
            {
                return Ok(await collectionClient.GetCollectionById(id));
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
