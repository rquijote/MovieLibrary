using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ITVShowListsClient
    {
        Task<TvShowListResponseDto> GetAiringTodayTVShowsAsync(int page = 1);
        Task<TvShowListResponseDto> GetOnTheAirTVShowsAsync(int page = 1);
        Task<TvShowListResponseDto> GetPopularTVShowsAsync(int page = 1);
        Task<TvShowListResponseDto> GetTopRatedTVShowsAsync(int page = 1);
    }
}
