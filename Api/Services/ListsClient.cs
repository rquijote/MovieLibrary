using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public class ListsClient(HttpClient http) : IListsClient
    {
        private readonly HttpClient _http = http;

        public async Task<ListStatusDto> CreateList(CreateListDto request)
        {
            var response = await _http.PostAsJsonAsync("", request);
            var result = await response.Content.ReadFromJsonAsync<ListStatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize list status response.");
        }

        public async Task<StatusDto> DeleteList(int listId)
        {
            var response = await _http.DeleteAsync($"{listId}");
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<ListDetailsDto> GetList(int listId)
        {
            var response = await _http.GetAsync($"{listId}");
            var result = await response.Content.ReadFromJsonAsync<ListDetailsDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize list details.");
        }

        public async Task<StatusDto> RemoveMovie(int listId, int mediaId)
        {
            var body = new { media_id = mediaId };
            var response = await _http.PostAsJsonAsync($"{listId}/remove_item", body);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> AddMovie(int listId, int mediaId)
        {
            var body = new { media_id = mediaId };
            var response = await _http.PostAsJsonAsync($"{listId}/add_item", body);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }
    }
}
