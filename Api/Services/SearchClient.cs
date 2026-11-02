using Application.Interfaces;
using Application.Models.Dto.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Api.Services
{
    public sealed class SearchClient(HttpClient http) : ISearchClient
    {
        private readonly HttpClient _http = http;

        public async Task<MovieListResponseDto> SearchMoviesAsync([FromQuery] string query)
        {
            var response = await _http.GetAsync($"movie?query={Uri.EscapeDataString(query)}");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize movie search response.");
        }

        public async Task<TvShowListResponseDto> SearchTVShowsAsync(string query)
        {
            var response = await _http.GetAsync($"tv?query={Uri.EscapeDataString(query)}");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize TV search response.");
        }

        public async Task<PersonSearchResponseDto> SearchPeopleAsync(string query)
        {
            var response = await _http.GetAsync($"person?query={Uri.EscapeDataString(query)}");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<PersonSearchResponseDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize people search response.");
        }

        public async Task<KeywordSearchResponseDto> SearchKeywordsAsync(string query)
        {
            var response = await _http.GetAsync($"keyword?query={Uri.EscapeDataString(query)}");
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<KeywordSearchResponseDto>();
            return result ?? throw new InvalidOperationException("Failed to deserialize keyword search response.");
        }
    }
}
