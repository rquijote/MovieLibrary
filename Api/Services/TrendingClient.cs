using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Requests;

namespace Api.Services
{
    public sealed class TrendingClient(HttpClient http) : ITrendingClient
    {
        private readonly HttpClient _http = http;

        public Task<TmdbSearchResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow)
        {
            throw new NotImplementedException();
        }
    }
}
