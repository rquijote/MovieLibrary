using Application.Interfaces;
using Application.Models.Dto;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Search
{
    public class SearchMovieTests
    {
        [Fact]
        public async Task SearchMoviesAsync_WithStarQuery_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies = 
                [
                    new() { Id = 11, Title = "Star Wars" },
                    new() { Id = 1255778, Title = "Lucky Star" },
                    new() { Id = 13475, Title = "Star Trek" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.SearchMoviesAsync("star"))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.SearchMoviesAsync("star");

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.Movies);
        }

        [Fact]
        public async Task SearchMoviesAsync_WithRingsQuery_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies = 
                [
                    new() { Id = 122, Title = "The Lord of the Rings: The Return of the King" },
                    new() { Id = 120, Title = "The Lord of the Rings: The Fellowship of the Ring" },
                    new() { Id = 121, Title = "The Lord of the Rings: The Two Towers" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.SearchMoviesAsync("rings"))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.SearchMoviesAsync("rings");

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.Movies);
        }

        [Fact]
        public async Task SearchTVAndMoviesAsync_WithTimeQuery_ReturnBothMatchingMedia()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies = 
                [
                    new() { Id = 122906, Title = "About Time" },
                    new() { Id = 429200, Title = "Good Time" },
                    new() { Id = 49530, Title = "In Time" }
                ],
                TVShows = 
                [
                    new() { Id = 44701, Name = "Adventure Time" },
                    new() { Id = 13354, Name = "Question Time" },
                    new() { Id = 4419, Name = "Real Time with Bill Maher" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.SearchMoviesAsync("time"))
                .ReturnsAsync(new TmdbSearchResponseDto { Movies = expected.Movies });

            tmdbClientMock
                .Setup(x => x.SearchTVShowsAsync("time"))
                .ReturnsAsync(new TmdbSearchResponseDto { TVShows = expected.TVShows });

            var movieResult = await tmdbClientMock.Object.SearchMoviesAsync("time");
            var tvResult = await tmdbClientMock.Object.SearchTVShowsAsync("time");

            movieResult.Should().NotBeNull();
            movieResult.Movies.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.Movies);

            tvResult.Should().NotBeNull();
            tvResult.TVShows.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.TVShows);
        }

        [Fact]
        public async Task SearchMoviesAsync_WithNoMatchingQuery_ReturnsEmptyResults()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies = []
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.SearchMoviesAsync("qqqqqqqqq"))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.SearchMoviesAsync("qqqqqqqqq");

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.BeEmpty();
        }

        [Fact]
        public async Task SearchMoviesAsync_WithEmptyQuery_ReturnsEmptyResults()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies = []
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.SearchMoviesAsync(""))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.SearchMoviesAsync("");

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.BeEmpty();
        }
    }
}
