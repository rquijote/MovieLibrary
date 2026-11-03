using System.Net;
using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public class TvShowClient(HttpClient http, CurrentTmdbUser? user = null) : ITvShowClient
    {
        private readonly HttpClient _http = http;

        public async Task<TvShowDto> GetTvShowById(int id)
        {
            var response = await _http.GetAsync(
                $"{id}?append_to_response=aggregate_credits,videos,images,recommendations,similar,reviews,content_ratings,keywords,external_ids,translations");

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

        /// <inheritdoc />
        public async Task<TvShowListResponseDto> GetRelatedTvShows(int id, bool similar, int page = 1)
        {
            ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
            ArgumentOutOfRangeException.ThrowIfGreaterThan(page, 500);
            var category = similar ? "similar" : "recommendations";
            using var response = await _http.GetAsync($"{id}/{category}?page={page}");
            await EnsureFound(response, $"TV show with ID {id}");
            return await response.Content.ReadFromJsonAsync<TvShowListResponseDto>()
                ?? throw new InvalidOperationException("Failed to deserialize related TV shows response.");
        }

        public async Task<TvSeasonDetailsDto> GetSeasonById(int id, int seasonNumber)
        {
            var response = await _http.GetAsync($"{id}/season/{seasonNumber}?append_to_response=credits,images");
            await EnsureFound(response, $"TV season {seasonNumber} for show {id}");
            var result = await response.Content.ReadFromJsonAsync<TvSeasonDetailsDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize TV season response.");
        }

        public async Task<TvEpisodeDto> GetEpisodeById(int id, int seasonNumber, int episodeNumber)
        {
            var response = await _http.GetAsync(
                $"{id}/season/{seasonNumber}/episode/{episodeNumber}?append_to_response=credits,videos,images");
            await EnsureFound(response, $"TV episode {episodeNumber} of season {seasonNumber} for show {id}");
            var result = await response.Content.ReadFromJsonAsync<TvEpisodeDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize TV episode response.");
        }

        private static async Task EnsureFound(HttpResponseMessage response, string description)
        {
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<StatusDto>();
                throw new KeyNotFoundException(errorResponse?.StatusMessage ?? $"{description} not found.");
            }

            response.EnsureSuccessStatusCode();
        }

        public async Task<StatusDto> AddRatingTvShow(int id, double rating)
        {
            var body = new { value = rating };
            var response = await _http.PostAsJsonAsync($"{id}/rating?{SessionQuery}", body);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<StatusDto> DeleteRatingTvShow(int id)
        {
            var response = await _http.DeleteAsync($"{id}/rating?{SessionQuery}");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<StatusDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize status response.");
        }

        public async Task<AccountStatesDto> GetAccountStateTvShow(int id)
        {
            var response = await _http.GetAsync($"{id}/account_states?{SessionQuery}");

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
        private string SessionQuery => user?.SessionQuery ?? throw new UnauthorizedAccessException("TMDB authentication required.");
    }
}
