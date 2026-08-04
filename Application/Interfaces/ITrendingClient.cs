using Application.Enums;
using Application.Models.Dto.Requests;

namespace Application.Interfaces
{
    public interface ITrendingClient
    {
        Task<TmdbSearchResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow);
        Task<TmdbSearchResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow);
    }
}
