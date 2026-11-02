using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IMovieClient
    {
        public Task<MovieDto> GetMovieById(int id);
        /// <summary>Retrieves a page of recommendations or similar movies.</summary>
        /// <param name="id">The source movie ID.</param>
        /// <param name="similar">Whether to retrieve similar titles instead of recommendations.</param>
        /// <param name="page">The result page, from 1 to 500.</param>
        /// <returns>The requested page of related movies.</returns>
        public Task<MovieListResponseDto> GetRelatedMovies(int id, bool similar, int page = 1);
        public Task<StatusDto> AddRatingMovie(int id, double rating);
        public Task<StatusDto> DeleteRatingMovie(int id);
        public Task<AccountStatesDto> GetAccountStateMovie(int id);
    }
}
