using Application.Interfaces;
using Application.Models.Dto.Requests;

namespace Api.Services
{
    public sealed class SearchClient(HttpClient http) : ISearchClient
    {
        private readonly HttpClient _http = http;

        public Task<TmdbSearchResponseDto> SearchMoviesAsync(string query)
        {
            throw new NotImplementedException();
        }

        public Task<TmdbSearchResponseDto> SearchTVShowsAsync(string query)
        {
            throw new NotImplementedException();
        }
    }
}
