using Application.Models.Dto.Requests;

namespace Application.Interfaces
{
    public interface ISearchClient
    {
        Task<TmdbSearchResponseDto> SearchMoviesAsync(string query);
        Task<TmdbSearchResponseDto> SearchTVShowsAsync(string query);
    }
}
