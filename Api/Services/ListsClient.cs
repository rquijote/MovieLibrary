using Application.Interfaces;
using Application.Enums;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Net.Http.Json;

namespace Api.Services
{
    public class ListsClient(HttpClient http) : IListsClient
    {
        private readonly HttpClient _http = http;

        public async Task<StatusDto> Create(CreateListDto request)
        {
            var payload = new
            {
                name = request.Name,
                description = request.Description,
                language = "en"
            };

            var response = await _http.PostAsJsonAsync("list", payload);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> Update(int listId, CreateListDto request)
        {
            var payload = new
            {
                name = request.Name,
                description = request.Description,
            };

            var response = await _http.PutAsJsonAsync($"list/{listId}", payload);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> Delete(int listId)
        {
            var response = await _http.DeleteAsync($"list/{listId}");
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<ListDetailsDto> Details(int listId)
        {
            var response = await _http.GetAsync($"list/{listId}");
            var result = await response.Content.ReadFromJsonAsync<ListDetailsDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize list details response.");
        }

        public async Task<StatusDto> AddMovie(int listId, int mediaId)
        {
            var response = await _http.PostAsJsonAsync($"list/{listId}/add_item", new { media_id = mediaId });
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> RemoveMovie(int listId, int mediaId)
        {
            var response = await _http.PostAsJsonAsync($"list/{listId}/remove_item", new { media_id = mediaId });
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> Clear(int listId)
        {
            var response = await _http.PostAsync($"list/{listId}/clear?confirm=true", null);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<ListItemStatusDto> CheckItemStatus(int listId, MediaType mediaType, int mediaId)
        {
            var response = await _http.GetAsync($"list/{listId}/item_status?movie_id={mediaId}");
            var result = await response.Content.ReadFromJsonAsync<ListItemStatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize list item status response.");
        }

    }
}
