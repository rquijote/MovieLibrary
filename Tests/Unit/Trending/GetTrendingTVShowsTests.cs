using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Application.Enums;
using Moq;
using FluentAssertions;

namespace Tests.Unit.Trending
{
    public class GetTrendingTVShowsTests
    {
        [Fact]
        public async Task GetTrendingTVShowsAsync_WithDayQuery_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Results =
                [
                    new() { Id = 271016, Name = "Mystic Nine" },
                    new() { Id = 103516, Name = "Star Trek: Strange New Worlds" },
                    new() { Id = 125988, Name = "Silo" },
                    new() { Id = 327814, Name = "Final Project" },
                    new() { Id = 30984, Name = "Bleach" },
                    new() { Id = 278624, Name = "Lucky" }
                ]
            };

            var trendingClientMock =new Mock<ITrendingClient>();
            trendingClientMock
                .Setup(x => x.GetTrendingTVShowsAsync(TimeWindow.day, 1))
                .ReturnsAsync(expected);

            var result = await trendingClientMock.Object.GetTrendingTVShowsAsync(TimeWindow.day, 1);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(6).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task GetTrendingTVShowsAsync_WithWeekQuery_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Results =
                [
                    new() { Id = 94997, Name = "House of the Dragon" },
                    new() { Id = 103516, Name = "Star Trek: Strange New Worlds" },
                    new() { Id = 125988, Name = "Silo" },
                    new() { Id = 278624, Name = "Lucky" },
                    new() { Id = 30984, Name = "Bleach" },
                    new() { Id = 296206, Name = "Agent Kim Reactivated" },
                    new() { Id = 60625, Name = "Rick and Morty" },
                    new() { Id = 287620, Name = "Stuart Fails to Save the Universe" }
                ]
            };

            var trendingClientMock = new Mock<ITrendingClient>();
            trendingClientMock
                .Setup(x => x.GetTrendingTVShowsAsync(TimeWindow.week, 1))
                .ReturnsAsync(expected);

            var result = await trendingClientMock.Object.GetTrendingTVShowsAsync(TimeWindow.week, 1);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(8).And.BeEquivalentTo(expected.Results);
        }
    }
}
