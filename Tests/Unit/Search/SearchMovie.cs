using Microsoft.AspNetCore.Mvc.Testing;
using Moq;
using Application.Interfaces;
using Api.Controllers.Dto.MovieTV;

namespace Tests.Unit.Search
{
    public class SearchMovie()
    {
        [Fact]
        public async Task SearchMovie_Star_ReturnsStarMovies()
        {
            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.SearchMoviesAsync("star"))
                .ReturnsAsync(new TmdbSearchResponseDto
                {
                    Movies =
                    [
                        new MovieSummaryDto { Id = 11, Title = "Star Wars" },
                        new MovieSummaryDto { Id = 1255778, Title = "Lucky Star" },
                        new MovieSummaryDto { Id = 13475, Title = "Star Trek" }
                    ]
                });

            // TODO: Add Act and Assert sections
        }
    }
}
