using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Search
{
    public class SearchMovieTests
    {
        [Fact]
        public async Task SearchMoviesAsync_WithStarQuery_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Results = 
                [
                    new() { Id = 11, Title = "Star Wars" },
                    new() { Id = 1255778, Title = "Lucky Star" },
                    new() { Id = 13475, Title = "Star Trek" }
                ]
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchMoviesAsync("star"))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchMoviesAsync("star");

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task SearchMoviesAsync_WithRingsQuery_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Results = 
                [
                    new() { Id = 122, Title = "The Lord of the Rings: The Return of the King" },
                    new() { Id = 120, Title = "The Lord of the Rings: The Fellowship of the Ring" },
                    new() { Id = 121, Title = "The Lord of the Rings: The Two Towers" }
                ]
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchMoviesAsync("rings"))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchMoviesAsync("rings");

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task SearchTVAndMoviesAsync_WithTimeQuery_ReturnBothMatchingMedia()
        {
            var expectedMovies = new MovieListResponseDto
            {
                Results = 
                [
                    new() { Id = 122906, Title = "About Time" },
                    new() { Id = 429200, Title = "Good Time" },
                    new() { Id = 49530, Title = "In Time" }
                ]
            };

            var expectedTV = new TvShowListResponseDto
            {
                Results = 
                [
                    new() { Id = 44701, Name = "Adventure Time" },
                    new() { Id = 13354, Name = "Question Time" },
                    new() { Id = 4419, Name = "Real Time with Bill Maher" }
                ]
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchMoviesAsync("time"))
                .ReturnsAsync(expectedMovies);

            searchClientMock
                .Setup(x => x.SearchTVShowsAsync("time"))
                .ReturnsAsync(expectedTV);

            var movieResult = await searchClientMock.Object.SearchMoviesAsync("time");
            var tvResult = await searchClientMock.Object.SearchTVShowsAsync("time");

            movieResult.Should().NotBeNull();
            movieResult.Results.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expectedMovies.Results);

            tvResult.Should().NotBeNull();
            tvResult.Results.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expectedTV.Results);
        }

        [Fact]
        public async Task SearchMoviesAsync_WithNoMatchingQuery_ReturnsEmptyResults()
        {
            var expected = new MovieListResponseDto
            {
                Results = []
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchMoviesAsync("qqqqqqqqq"))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchMoviesAsync("qqqqqqqqq");

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.BeEmpty();
        }

        [Fact]
        public async Task SearchMoviesAsync_WithEmptyQuery_ReturnsEmptyResults()
        {
            var expected = new MovieListResponseDto
            {
                Results = []
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchMoviesAsync(""))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchMoviesAsync("");

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.BeEmpty();
        }
    }
}
