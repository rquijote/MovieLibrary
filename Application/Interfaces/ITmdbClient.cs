using Application.Models.Dto;

namespace Application.Interfaces
{
    public interface ITmdbClient
    {
        // Search for movies by query string
        Task<TmdbSearchResponseDto> SearchMoviesAsync(string query);
        Task<TmdbSearchResponseDto> SearchTVShowsAsync(string query);

        /* Example implementation logic (hardcoded):
         * 
         * How to return TmdbSearchResponseDto with BOTH movies AND TV shows:
         * 
         * public async Task<TmdbSearchResponseDto> SearchMoviesAsync(string query)
         * {
         *     // Create the response object
         *     var response = new TmdbSearchResponseDto
         *     {
         *         // Populate Movies list
         *         Movies = new List<MovieSummaryDto>
         *         {
         *             new MovieSummaryDto { Id = 11, Title = "Star Wars" },
         *             new MovieSummaryDto { Id = 13475, Title = "Star Trek" },
         *             new MovieSummaryDto { Id = 120, Title = "The Lord of the Rings" }
         *         },
         *         
         *         // Populate TVShows list
         *         TVShows = new List<TVSummaryDto>
         *         {
         *             new TVSummaryDto { Id = 1399, Name = "Game of Thrones" },
         *             new TVSummaryDto { Id = 68595, Name = "Planet Earth" },
         *             new TVSummaryDto { Id = 79525, Name = "The Last Dance" }
         *         }
         *     };
         *     
         *     // Return the object with both lists populated
         *     return response;
         * }
         * 
         * KEY POINTS:
         * - TmdbSearchResponseDto has TWO properties: Movies and TVShows
         * - You can populate BOTH at the same time
         * - Or populate just one (set the other to null or empty list)
         * - Movies uses Id + Title
         * - TVShows uses Id + Name (notice the difference!)
         */
    }
}
