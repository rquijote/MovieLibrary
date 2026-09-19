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

        public async Task<StatusDto> CreateList(CreateListDto request)
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

        public async Task<StatusDto> DeleteList(int listId)
        {
            var response = await _http.DeleteAsync($"list/{listId}");
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<ListDetailsDto> GetList(int listId)
        {
            var details = await GetDetails(listId);

            return new ListDetailsDto
            {
                Id = details.Id.ToString(),
                Name = details.Name,
                Description = details.Description,
                ItemCount = details.ItemCount,
                Items = []
            };
        }

        public async Task<StatusDto> RemoveMovie(int listId, int mediaId)
        {
            var response = await _http.PostAsJsonAsync($"list/{listId}/remove_item", new { media_id = mediaId });
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> AddMovie(int listId, int mediaId)
        {
            var response = await _http.PostAsJsonAsync($"list/{listId}/add_item", new { media_id = mediaId });
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<ListDetailsSummaryDto> GetDetails(int listId)
        {
            var response = await _http.GetAsync($"list/{listId}");
            var result = await response.Content.ReadFromJsonAsync<ListDetailsDto>();

            if (result is null)
            {
                throw new InvalidOperationException("Failed to deserialize list details response.");
            }

            return new ListDetailsSummaryDto
            {
                Id = int.TryParse(result.Id, out var parsedId) ? parsedId : 0,
                Name = result.Name,
                Description = result.Description,
                ItemCount = result.ItemCount,
                Results = []
            };
        }

        public async Task<StatusDto> AddItems(int listId, ListItemsRequestDto request)
        {
            StatusDto? lastResult = null;

            foreach (var item in request.Items)
            {
                var response = await _http.PostAsJsonAsync($"list/{listId}/add_item", new { media_id = item.MediaId });
                lastResult = await response.Content.ReadFromJsonAsync<StatusDto>();

                if (lastResult is not null && !lastResult.Success)
                {
                    return lastResult;
                }
            }

            return lastResult ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> Clear(int listId)
        {
            var response = await _http.GetAsync($"list/{listId}/clear?confirm=true");
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<ListItemStatusDto> GetItemStatus(int listId, MediaType mediaType, int mediaId)
        {
            var response = await _http.GetAsync($"list/{listId}/item_status?movie_id={mediaId}");
            var result = await response.Content.ReadFromJsonAsync<ListItemStatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize list item status response.");
        }

        public async Task<StatusDto> RemoveItems(int listId, ListItemsRequestDto request)
        {
            StatusDto? lastResult = null;

            foreach (var item in request.Items)
            {
                var response = await _http.PostAsJsonAsync($"list/{listId}/remove_item", new { media_id = item.MediaId });
                lastResult = await response.Content.ReadFromJsonAsync<StatusDto>();

                if (lastResult is not null && !lastResult.Success)
                {
                    return lastResult;
                }
            }

            return lastResult ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> Update(int listId, UpdateListDto request)
        {
            var response = await _http.PutAsJsonAsync($"list/{listId}", request);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> UpdateItems(int listId, ListItemsRequestDto request)
        {
            var clearResult = await Clear(listId);

            if (!clearResult.Success)
            {
                return clearResult;
            }

            return await AddItems(listId, request);
        }

    }
}
