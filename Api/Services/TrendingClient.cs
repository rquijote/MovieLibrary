using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class TrendingClient(HttpClient http) : ITrendingClient
    {
        private readonly HttpClient _http = http;

        public async Task<MovieListResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow, int pageNum)
        {
            var response = await _http.GetAsync($"movie/{timeWindow}?page={pageNum}");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? new MovieListResponseDto();
        }

        public async Task<TvShowListResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow, int pageNum)
        {
            var response = await _http.GetAsync($"tv/{timeWindow}?page={pageNum}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return result ?? new TvShowListResponseDto();
        }
    }
}
