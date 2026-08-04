using Application.Models.Dto.Requests;

namespace Application.Interfaces
{
    public interface ITVShowListsClient
    {
        Task<TmdbSearchResponseDto> GetAiringTodayTVShowsAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetOnTheAirTVShowsAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetPopularTVShowsAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetTopRatedTVShowsAsync(int page = 1);
    }
}
