using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IMovieListsClient
    {
        Task<MovieListResponseDto> GetNowPlayingMoviesAsync(int page = 1);
        Task<MovieListResponseDto> GetPopularMoviesAsync(int page = 1);
        Task<MovieListResponseDto> GetTopRatedMoviesAsync(int page = 1);
        Task<MovieListResponseDto> GetUpcomingMoviesAsync(int page = 1);
    }
}
