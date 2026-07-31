using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Enums;
using Moq;
using FluentAssertions;

namespace Tests.Unit.Trending
{
    public class GetTrendingMoviesTests
    {
        [Fact]
        public async Task GetTrendingMoviesAsync_WithDayQuery_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 934433, Title = "Scream VI" },
                    new() { Id = 868759, Title = "Ghosted" },
                    new() { Id = 502356, Title = "The Super Mario Bros. Movie" },
                    new() { Id = 640146, Title = "Ant-Man and the Wasp: Quantumania" },
                    new() { Id = 713704, Title = "Evil Dead Rise" },
                    new() { Id = 298618, Title = "The Flash" }
                ]
            };

            var TmdbClientMock = new Mock<ITmdbClient>();
            TmdbClientMock
                .Setup(x => x.GetTrendingMoviesAsync(TimeWindow.Day))
                .ReturnsAsync(expected);

            var result = await TmdbClientMock.Object.GetTrendingMoviesAsync(TimeWindow.Day);

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(6).And.BeEquivalentTo(expected.Movies);
        }

        [Fact]
        public async Task GetTrendingMoviesAsync_WithWeekQuery_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 969681, Title = "Spider-Man: Brand New Day" },
                    new() { Id = 1081003, Title = "Supergirl" },
                    new() { Id = 1083381, Title = "Backrooms" },
                    new() { Id = 1368337, Title = "The Odyssey" },
                    new() { Id = 454639, Title = "Masters of the Universe" }
                ]
            };

            var TmdbClientMock = new Mock<ITmdbClient>();
            TmdbClientMock
                .Setup(x => x.GetTrendingMoviesAsync(TimeWindow.Week))
                .ReturnsAsync(expected);

            var result = await TmdbClientMock.Object.GetTrendingMoviesAsync(TimeWindow.Week);

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Movies);
        }
    }
}
