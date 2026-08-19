using Application.Interfaces;
using Application.Models.Dto.Responses;
using System.Net;

namespace Api.Services
{
    public class TvShowClient(HttpClient http) : ITvShowClient
    {
        private readonly HttpClient _http = http;

        public async Task<TvShowDto> GetTvShowById(int id)
        {
            var response = await _http.GetAsync($"{id}");

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                    throw new KeyNotFoundException(
                        errorResponse?.StatusMessage ?? $"TV show with ID {id} not found.");
                }
            }

            var result = await response.Content.ReadFromJsonAsync<TvShowDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize TV show response.");
        }

        public Task<StatusDto> AddRatingTvShow(int id, double rating)
        {
            throw new NotImplementedException();
        }

        public Task<StatusDto> DeleteRatingTvShow(int id)
        {
            throw new NotImplementedException();
        }
    }
}
