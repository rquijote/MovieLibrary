using Api.Services;
using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListsController(IListsClient listsClient) : ControllerBase
    {
        private readonly IListsClient _listsClient = listsClient;

        [HttpPost("{listId}/add_movie")]
        public async Task<IActionResult> AddMovie(int listId, [FromBody] int mediaId)
        {
            var result = await _listsClient.AddMovie(listId, mediaId);
            return Ok(result);
        }

        [HttpGet("{listId}/item_status")]
        public async Task<IActionResult> CheckItemStatus(int listId, [FromQuery(Name = "media_type")] MediaType mediaType, [FromQuery(Name = "media_id")] int mediaId)
        {
            var result = await _listsClient.CheckItemStatus(listId, mediaType, mediaId);
            return Ok(result);
        }

        [HttpPost("{listId}/clear")]
        public async Task<IActionResult> Clear(int listId)
        {
            var result = await _listsClient.Clear(listId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateListDto request)
        {
            var result = await _listsClient.Create(request);
            return Ok(result);
        }

        [HttpDelete("{listId}")]
        public async Task<IActionResult> Delete(int listId)
        {
            var result = await _listsClient.Delete(listId);
            return Ok(result);
        }

        [HttpGet("{listId}/details")]
        public async Task<IActionResult> Details(int listId)
        {
            var result = await _listsClient.Details(listId);
            return Ok(result);
        }

        [HttpPost("{listId}/remove_movie")]
        public async Task<IActionResult> RemoveMovie(int listId, [FromBody] int mediaId)
        {
            var result = await _listsClient.RemoveMovie(listId, mediaId);
            return Ok(result);
        }
    }
}
