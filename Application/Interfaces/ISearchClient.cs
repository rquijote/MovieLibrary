using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ISearchClient
    {
        Task<MovieListResponseDto> SearchMoviesAsync(string query);
        Task<TvShowListResponseDto> SearchTVShowsAsync(string query);
        Task<PersonSearchResponseDto> SearchPeopleAsync(string query);
        Task<KeywordSearchResponseDto> SearchKeywordsAsync(string query);
    }
}
