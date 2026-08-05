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
            var response = await _http.GetAsync($"movie?query={query}");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? new MovieListResponseDto();
        }

        public Task<TvShowListResponseDto> SearchTVShowsAsync(string query)
        {
            throw new NotImplementedException();
        }
    }
}
