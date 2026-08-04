using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Api.Services
{
    public sealed class SearchClient(HttpClient http) : ISearchClient
    {
        private readonly HttpClient _http = http;

        public async Task<TmdbSearchResponseDto> SearchMoviesAsync(string query)
        {
            var response = await _http.GetAsync($"movie?query={Uri.EscapeDataString(query)}");
            var page = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return new TmdbSearchResponseDto
            {
                Movies = page?.Results?.Select(m => new MovieSummaryDto { Id = m.Id, Title = m.Title }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> SearchTVShowsAsync(string query)
        {
            var response = await _http.GetAsync($"tv?query={Uri.EscapeDataString(query)}");
            var page = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return new TmdbSearchResponseDto
            {
                TVShows = page?.Results?.Select(t => new TVSummaryDto { Id = t.Id, Name = t.Name }).ToList() ?? []
            };
        }
    }
}
