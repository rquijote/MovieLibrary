using Application.Models.Dto.Requests;

namespace Application.Interfaces
{
    public interface IMovieListsClient
    {
        Task<TmdbSearchResponseDto> GetNowPlayingMoviesAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetPopularMoviesAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetTopRatedMoviesAsync(int page = 1);
        Task<TmdbSearchResponseDto> GetUpcomingMoviesAsync(int page = 1);
    }
}
