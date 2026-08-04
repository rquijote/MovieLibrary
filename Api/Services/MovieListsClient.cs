using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Net.Http.Json;

namespace Api.Services
{
    public sealed class MovieListsClient(HttpClient http) : IMovieListsClient
    {
        private readonly HttpClient _http = http;

        public async Task<TmdbSearchResponseDto> GetNowPlayingMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync($"now_playing?page={page}");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return new TmdbSearchResponseDto
            {
                Movies = result?.Results?.Select(m => new MovieSummaryDto { Id = m.Id, Title = m.Title }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> GetPopularMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync($"popular?page={page}");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return new TmdbSearchResponseDto
            {
                Movies = result?.Results?.Select(m => new MovieSummaryDto { Id = m.Id, Title = m.Title }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> GetTopRatedMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync($"top_rated?page={page}");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return new TmdbSearchResponseDto
            {
                Movies = result?.Results?.Select(m => new MovieSummaryDto { Id = m.Id, Title = m.Title }).ToList() ?? []
            };
        }

        public async Task<TmdbSearchResponseDto> GetUpcomingMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync($"upcoming?page={page}");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return new TmdbSearchResponseDto
            {
                Movies = result?.Results?.Select(m => new MovieSummaryDto { Id = m.Id, Title = m.Title }).ToList() ?? []
            };
        }
    }
}
