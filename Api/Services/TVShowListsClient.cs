using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class TVShowListsClient(HttpClient http) : ITVShowListsClient
    {
        private readonly HttpClient _http = http;

        public async Task<TvShowListResponseDto> GetAiringTodayTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"airing_today?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return result ?? new TvShowListResponseDto();
        }

        public async Task<TvShowListResponseDto> GetOnTheAirTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"on_the_air?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return result ?? new TvShowListResponseDto();
        }

        public async Task<TvShowListResponseDto> GetPopularTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"popular?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return result ?? new TvShowListResponseDto();
        }

        public async Task<TvShowListResponseDto> GetTopRatedTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"top_rated?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return result ?? new TvShowListResponseDto();
        }
    }
}
