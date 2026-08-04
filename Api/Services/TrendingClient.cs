using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Net.Http.Json;

namespace Api.Services
{
    public sealed class TrendingClient(HttpClient http) : ITrendingClient
    {
        private readonly HttpClient _http = http;

        public async Task<TmdbSearchResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow)
        {
            var window = timeWindow == TimeWindow.Day ? "day" : "week";
            var response = await _http.GetAsync($"movie/{window}");
            var page = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return new TmdbSearchResponseDto
            {
                Movies = page?.Results?.Select(m => new MovieSummaryDto { Id = m.Id, Title = m.Title }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow)
        {
            var window = timeWindow == TimeWindow.Day ? "day" : "week";
            var response = await _http.GetAsync($"tv/{window}");
            var page = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return new TmdbSearchResponseDto
            {
                TVShows = page?.Results?.Select(t => new TVSummaryDto { Id = t.Id, Name = t.Name }).ToList() ?? []
            };
        }
    }
}
