using Api.Services;
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

        [HttpPost("{listId}/remove_item")]
        public async Task<IActionResult> RemoveMovie(int listId, int mediaId)
        {
            var result = await _listsClient.RemoveMovie(listId, mediaId);
            return Ok(result);
        }

        [HttpPost("{listId}/add_item")]
        public async Task<IActionResult> AddMovie(int listId, int mediaId)
        {
            var result = await _listsClient.AddMovie(listId, mediaId);
            return Ok(result);
        }
    }
}
