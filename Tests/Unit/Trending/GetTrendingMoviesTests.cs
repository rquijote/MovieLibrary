using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
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
            var expected = new MovieListResponseDto
            {
                Results =
                [
                    new() { Id = 934433, Title = "Scream VI" },
                    new() { Id = 868759, Title = "Ghosted" },
                    new() { Id = 502356, Title = "The Super Mario Bros. Movie" },
                    new() { Id = 640146, Title = "Ant-Man and the Wasp: Quantumania" },
                    new() { Id = 713704, Title = "Evil Dead Rise" },
                    new() { Id = 298618, Title = "The Flash" }
                ]
            };

            var trendingClientMock = new Mock<ITrendingClient>();
            trendingClientMock
                .Setup(x => x.GetTrendingMoviesAsync(TimeWindow.day))
                .ReturnsAsync(expected);

            var result = await trendingClientMock.Object.GetTrendingMoviesAsync(TimeWindow.day);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(6).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task GetTrendingMoviesAsync_WithWeekQuery_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Results =
                [
                    new() { Id = 969681, Title = "Spider-Man: Brand New Day" },
                    new() { Id = 1081003, Title = "Supergirl" },
                    new() { Id = 1083381, Title = "Backrooms" },
                    new() { Id = 1368337, Title = "The Odyssey" },
                    new() { Id = 454639, Title = "Masters of the Universe" }
                ]
            };

            var trendingClientMock = new Mock<ITrendingClient>();
            trendingClientMock
                .Setup(x => x.GetTrendingMoviesAsync(TimeWindow.week))
                .ReturnsAsync(expected);

            var result = await trendingClientMock.Object.GetTrendingMoviesAsync(TimeWindow.week);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }
    }
}
