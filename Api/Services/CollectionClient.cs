using System.Net;
using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class CollectionClient(HttpClient http) : ICollectionClient
    {
        private readonly HttpClient _http = http;

        public async Task<MovieCollectionDto> GetCollectionById(int id)
        {
            var response = await _http.GetAsync($"{id}");
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                throw new KeyNotFoundException(
                    errorResponse?.StatusMessage ?? $"Collection with ID {id} not found.");
            }

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<MovieCollectionDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize collection response.");
        }
    }
}
