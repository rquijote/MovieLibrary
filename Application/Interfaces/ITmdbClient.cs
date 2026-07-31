using Application.Enums;
using Application.Models.Dto;

namespace Application.Interfaces
{
    public interface ITmdbClient
    {

        // Search for movies by query string
        Task<TmdbSearchResponseDto> SearchMoviesAsync(string query);
        Task<TmdbSearchResponseDto> SearchTVShowsAsync(string query);

        // Trending
        Task<TmdbSearchResponseDto> GetTrendingMoviesAsync(TimeWindow timeWindow);
        Task<TmdbSearchResponseDto> GetTrendingTVShowsAsync(TimeWindow timeWindow);

        // Movie Lists
        Task<TmdbSearchResponseDto> GetNowPlayingMoviesAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetPopularMoviesAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetTopRatedMoviesAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetUpcomingMoviesAsync(int page = 1);

        // TV Shows Lists
        Task<TmdbSearchResponseDto> GetAiringTodayTVShowsAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetOnTheAirTVShowsAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetPopularTVShowsAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetTopRatedTVShowsAsync(int page = 1);
    }
}
