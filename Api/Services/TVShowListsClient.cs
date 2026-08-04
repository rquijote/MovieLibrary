using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Net.Http.Json;

namespace Api.Services
{
    public sealed class TVShowListsClient(HttpClient http) : ITVShowListsClient
    {
        private readonly HttpClient _http = http;

        public async Task<TmdbSearchResponseDto> GetAiringTodayTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"airing_today?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return new TmdbSearchResponseDto
            {
                TVShows = result?.Results?.Select(t => new TVSummaryDto { Id = t.Id, Name = t.Name }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> GetOnTheAirTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"on_the_air?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return new TmdbSearchResponseDto
            {
                TVShows = result?.Results?.Select(t => new TVSummaryDto { Id = t.Id, Name = t.Name }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> GetPopularTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"popular?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return new TmdbSearchResponseDto
            {
                TVShows = result?.Results?.Select(t => new TVSummaryDto { Id = t.Id, Name = t.Name }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> GetTopRatedTVShowsAsync(int page = 1)
        {
            var response = await _http.GetAsync($"top_rated?page={page}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return new TmdbSearchResponseDto
            {
                TVShows = result?.Results?.Select(t => new TVSummaryDto { Id = t.Id, Name = t.Name }).ToList() ?? []
            };
        }
    }
}
