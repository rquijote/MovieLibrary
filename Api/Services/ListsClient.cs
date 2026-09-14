using Application.Interfaces;
using Application.Enums;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Services
{
    public class ListsClient(HttpClient http) : IListsClient
    {
        private readonly HttpClient _http = http;

        public async Task<ListStatusDto> CreateList(CreateListDto request)
        {
            var payload = new
            {
                name = request.Name,
                description = request.Description,
                iso_639_1 = request.Language
            };

            var response = await _http.PostAsJsonAsync("", payload);
            return await ReadListStatusResponse(response);
        }

        public async Task<StatusDto> DeleteList(int listId)
        {
            var response = await _http.DeleteAsync($"{listId}");
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
            return await RemoveItems(
                listId,
                new V4ListItemsRequestDto
                {
                    Items = [new V4ListItemDto { MediaType = MediaType.movie, MediaId = mediaId }]
                });
        }

        public async Task<StatusDto> AddMovie(int listId, int mediaId)
        {
            return await AddItems(
                listId,
                new V4ListItemsRequestDto
                {
                    Items = [new V4ListItemDto { MediaType = MediaType.movie, MediaId = mediaId }]
                });
        }

        public async Task<V4ListDetailsDto> GetDetails(int listId)
        {
            var response = await _http.GetAsync($"{listId}");
            var result = await response.Content.ReadFromJsonAsync<V4ListDetailsDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize v4 list details response.");
        }

        public async Task<StatusDto> AddItems(int listId, V4ListItemsRequestDto request)
        {
            var response = await _http.PostAsJsonAsync($"{listId}/items", request);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> Clear(int listId)
        {
            var response = await _http.GetAsync($"{listId}/clear");
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<V4ListItemStatusDto> GetItemStatus(int listId, MediaType mediaType, int mediaId)
        {
            var response = await _http.GetAsync($"{listId}/item_status?media_type={mediaType}&media_id={mediaId}");
            var result = await response.Content.ReadFromJsonAsync<V4ListItemStatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize list item status response.");
        }

        public async Task<StatusDto> RemoveItems(int listId, V4ListItemsRequestDto request)
        {
            using var deleteRequest = new HttpRequestMessage(HttpMethod.Delete, $"{listId}/items")
            {
                Content = JsonContent.Create(request)
            };

            var response = await _http.SendAsync(deleteRequest);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> Update(int listId, UpdateListDto request)
        {
            var response = await _http.PutAsJsonAsync($"{listId}", request);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> UpdateItems(int listId, V4ListItemsRequestDto request)
        {
            var response = await _http.PutAsJsonAsync($"{listId}/items", request);
            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        private static async Task<ListStatusDto> ReadListStatusResponse(HttpResponseMessage response)
        {
            var raw = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrWhiteSpace(raw))
            {
                throw new InvalidOperationException("Empty list status response.");
            }

            using var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;

            var statusCode = root.TryGetProperty("status_code", out var statusCodeElement)
                ? statusCodeElement.GetInt32()
                : (int)response.StatusCode;

            var success = root.TryGetProperty("success", out var successElement) && successElement.GetBoolean();

            string? statusMessage = null;
            if (root.TryGetProperty("status_message", out var statusMessageElement)
                && statusMessageElement.ValueKind == JsonValueKind.String)
            {
                statusMessage = statusMessageElement.GetString();
            }

            var listId = 0;
            if (root.TryGetProperty("list_id", out var listIdElement) && listIdElement.TryGetInt32(out var v3ListId))
            {
                listId = v3ListId;
            }
            else if (root.TryGetProperty("id", out var idElement) && idElement.TryGetInt32(out var v4ListId))
            {
                listId = v4ListId;
            }

            return new ListStatusDto
            {
                Success = success,
                StatusCode = statusCode,
                StatusMessage = statusMessage,
                ListId = listId
            };
        }
    }
}
