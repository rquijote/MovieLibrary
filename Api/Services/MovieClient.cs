using System.Net;
using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class MovieClient(HttpClient http) : IMovieClient
    {
        private readonly HttpClient _http = http;

        public async Task<MovieDto> GetMovieById(int id)
        {
            var response = await _http.GetAsync($"{id}");

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                    throw new KeyNotFoundException(
                        errorResponse?.StatusMessage ?? $"Movie with ID {id} not found.");
                }
            }

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<MovieDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize movie response.");
        }

        public async Task<StatusDto> AddRatingMovie(int id, double rating)
        {
            var body = new { value = rating };
            var response = await _http.PostAsJsonAsync($"{id}/rating", body);

            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> DeleteRatingMovie(int id)
        {
            var response = await _http.DeleteAsync($"{id}/rating");

            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }
    }
}
