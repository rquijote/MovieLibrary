using Application.Enums;
using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ITrendingClient
    {
        Task<MovieListResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow);
        Task<TvShowListResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow);
    }
}
