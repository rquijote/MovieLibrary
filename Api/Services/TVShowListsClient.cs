using Application.Interfaces;
using Application.Models.Dto.Responses;

namespace Api.Services
{
    public sealed class TVShowListsClient(HttpClient http) : ITVShowListsClient
    {
        private readonly HttpClient _http = http;

        public Task<TvShowListResponseDto> GetAiringTodayTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TvShowListResponseDto> GetOnTheAirTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TvShowListResponseDto> GetPopularTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }

        public Task<TvShowListResponseDto> GetTopRatedTVShowsAsync(int page = 1)
        {
            throw new NotImplementedException();
        }
    }
}
