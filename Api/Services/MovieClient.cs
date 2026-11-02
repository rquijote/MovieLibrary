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
            var response = await _http.GetAsync(
                $"{id}?append_to_response=credits,videos,images,recommendations,similar,reviews,release_dates,keywords,external_ids,translations");

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

        /// <inheritdoc />
        public async Task<MovieListResponseDto> GetRelatedMovies(int id, bool similar, int page = 1)
        {
            ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
            ArgumentOutOfRangeException.ThrowIfGreaterThan(page, 500);
            var category = similar ? "similar" : "recommendations";
            using var response = await _http.GetAsync($"{id}/{category}?page={page}");
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                throw new KeyNotFoundException(errorResponse?.StatusMessage ?? $"Movie with ID {id} not found.");
            }

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<MovieListResponseDto>()
                ?? throw new InvalidOperationException("Failed to deserialize related movies response.");
        }

        public async Task<AccountStatesDto> GetAccountStateMovie(int id)
        {
            var response = await _http.GetAsync($"{id}/account_states");

            if (!response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.NotFound)
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                throw new KeyNotFoundException(
                    errorResponse?.StatusMessage ?? $"Movie account state with ID {id} not found.");
            }

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<AccountStatesDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize movie account states response.");
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
