using Application.Enums;
using Application.Models.Dto;

namespace Application.Interfaces
{
    public interface ITmdbClient
    {

        // Search for movies by query string
        Task<TmdbSearchResponseDto> SearchMoviesAsync(string query);
        Task<TmdbSearchResponseDto> SearchTVShowsAsync(string query);

        Task<TmdbSearchResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow);
        Task<TmdbSearchResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow);
    }
}
