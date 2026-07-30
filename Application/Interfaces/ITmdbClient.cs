using Application.Models.Dto;

namespace Application.Interfaces
{
    public interface ITmdbClient
    {
        // Search for movies by query string
        Task<TmdbSearchResponseDto> SearchMoviesAsync(string query);
    }
}
