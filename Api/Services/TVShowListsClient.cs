using Application.Interfaces;
using Application.Models.Dto.Requests;

namespace Api.Services
{
    public sealed class TVShowListsClient(HttpClient http) : ITVShowListsClient
    {
        private readonly HttpClient _http = http;

        public Task<TmdbSearchResponseDto> GetAiringTodayTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> GetOnTheAirTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> GetPopularTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> GetTopRatedTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }
    }
}
