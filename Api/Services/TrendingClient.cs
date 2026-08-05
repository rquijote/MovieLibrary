using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class TrendingClient(HttpClient http) : ITrendingClient
    {
        private readonly HttpClient _http = http;

        public Task<MovieListResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow)
        {
            throw new NotImplementedException();
        }

        public Task<TvShowListResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow)
        {
            throw new NotImplementedException();
        }
    }
}
