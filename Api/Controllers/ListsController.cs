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

        [HttpPost]
        public async Task<IActionResult> CreateList(CreateListDto request)
        {
            var result = await _listsClient.CreateList(request);
            return Ok(result);
        }

        [HttpDelete("{listId}")]
        public async Task<IActionResult> DeleteList(int listId)
        {
            var result = await _listsClient.DeleteList(listId);
            return Ok(result);
        }

        [HttpGet("{listId}")]
        public async Task<IActionResult> GetList(int listId)
        {
            var result = await _listsClient.GetList(listId);
            return Ok(result);
        }

        [HttpGet("{listId}/details")]
        public async Task<IActionResult> GetDetails(int listId)
        {
            var result = await _listsClient.GetDetails(listId);
            return Ok(result);
        }

        [HttpPost("{listId}/items")]
        public async Task<IActionResult> AddItems(int listId, [FromBody] ListItemsRequestDto request)
        {
            var result = await _listsClient.AddItems(listId, request);
            return Ok(result);
        }

        [HttpGet("{listId}/clear")]
        public async Task<IActionResult> Clear(int listId)
        {
            var result = await _listsClient.Clear(listId);
            return Ok(result);
        }

        [HttpGet("{listId}/item_status")]
        public async Task<IActionResult> GetItemStatus(int listId, [FromQuery(Name = "media_type")] MediaType mediaType, [FromQuery(Name = "media_id")] int mediaId)
        {
            var result = await _listsClient.GetItemStatus(listId, mediaType, mediaId);
            return Ok(result);
        }

        [HttpDelete("{listId}/items")]
        public async Task<IActionResult> RemoveItems(int listId, [FromBody] ListItemsRequestDto request)
        {
            var result = await _listsClient.RemoveItems(listId, request);
            return Ok(result);
        }

        [HttpPut("{listId}")]
        public async Task<IActionResult> Update(int listId, [FromBody] UpdateListDto request)
        {
            var result = await _listsClient.Update(listId, request);
            return Ok(result);
        }

        [HttpPut("{listId}/items")]
        public async Task<IActionResult> UpdateItems(int listId, [FromBody] ListItemsRequestDto request)
        {
            var result = await _listsClient.UpdateItems(listId, request);
            return Ok(result);
        }

        [HttpPost("{listId}/remove_item")]
        public async Task<IActionResult> RemoveMovie(int listId, [FromBody] int mediaId)
        {
            var result = await _listsClient.RemoveMovie(listId, mediaId);
            return Ok(result);
        }

        [HttpPost("{listId}/add_item")]
        public async Task<IActionResult> AddMovie(int listId, [FromBody] int mediaId)
        {
            var result = await _listsClient.AddMovie(listId, mediaId);
            return Ok(result);
        }
    }
}
