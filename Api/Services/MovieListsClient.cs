using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class MovieListsClient(HttpClient http) : IMovieListsClient
    {
        private readonly HttpClient _http = http;

        public async Task<MovieListResponseDto> GetNowPlayingMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync("now_playing");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? new MovieListResponseDto();
        }

        public async Task<MovieListResponseDto> GetPopularMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync("popular");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? new MovieListResponseDto();
        }

        public async Task<MovieListResponseDto> GetTopRatedMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync("top_rated");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? new MovieListResponseDto();
        }

        public async Task<MovieListResponseDto> GetUpcomingMoviesAsync(int page = 1)
        {
            var response = await _http.GetAsync("upcoming");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? new MovieListResponseDto();
        }
    }
}
