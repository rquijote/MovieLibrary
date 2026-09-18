using System.Net;
using Application.Interfaces;
using Application.Models.Dto.Responses;

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
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TvShowDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize TV show response.");
        }

        public async Task<StatusDto> AddRatingTvShow(int id, double rating)
        {
            var body = new { value = rating };
            var response = await _http.PostAsJsonAsync($"{id}/rating", body);

            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> DeleteRatingTvShow(int id)
        {
            var response = await _http.DeleteAsync($"{id}/rating");

            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<AccountStatesDto> GetAccountStateTvShow(int id)
        {
            var response = await _http.GetAsync($"{id}/account_states");

            if (!response.IsSuccessStatusCode && response.StatusCode == HttpStatusCode.NotFound)
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                throw new KeyNotFoundException(
                    errorResponse?.StatusMessage ?? $"TV show account state with ID {id} not found.");
            }

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<AccountStatesDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize TV show account states response.");
        }
    }
}
