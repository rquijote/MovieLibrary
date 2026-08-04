using Application.Interfaces;
using Application.Models.Dto.Requests;

namespace Api.Services
{
    public sealed class MovieListsClient(HttpClient http) : IMovieListsClient
    {
        private readonly HttpClient _http = http;

        public Task<TmdbSearchResponseDto> GetNowPlayingMoviesAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> GetPopularMoviesAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> GetTopRatedMoviesAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> GetUpcomingMoviesAsync(int page = 1)
        {
            throw new NotImplementedException();
        }
    }
}
