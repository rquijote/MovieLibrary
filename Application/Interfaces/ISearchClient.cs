using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ISearchClient
    {
        Task<MovieListResponseDto> SearchMoviesAsync(string query);
        Task<TvShowListResponseDto> SearchTVShowsAsync(string query);
    }
}
