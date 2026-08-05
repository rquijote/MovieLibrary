using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Moq;
using FluentAssertions;

namespace Tests.Unit.TVShowLists
{
    public class GetAiringTodayTVShowsTests
    {
        [Fact]
        public async Task GetAiringTodayTVShowsAsync_WithDefaultPage_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Results =
                [
                    new() { Id = 125988, Name = "Silo" },
                    new() { Id = 22980, Name = "Watch What Happens Live with Andy Cohen" },
                    new() { Id = 59941, Name = "The Tonight Show Starring Jimmy Fallon" },
                    new() { Id = 61818, Name = "Late Night with Seth Meyers" },
                    new() { Id = 2224, Name = "The Daily Show" },
                    new() { Id = 287620, Name = "Stuart Fails to Save the Universe" },
                    new() { Id = 291, Name = "Coronation Street" },
                    new() { Id = 10160, Name = "Big Brother" },
                    new() { Id = 277439, Name = "Cape Fear" },
                    new() { Id = 103516, Name = "Star Trek: Strange New Worlds" }
                ]
            };

            var tvShowListsClientMock = new Mock<ITVShowListsClient>();
            tvShowListsClientMock
                .Setup(x => x.GetAiringTodayTVShowsAsync(1))
                .ReturnsAsync(expected);

            var result = await tvShowListsClientMock.Object.GetAiringTodayTVShowsAsync();

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(10).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task GetAiringTodayTVShowsAsync_WithSpecificPage_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Results =
                [
                    new() { Id = 1685, Name = "Project Runway" },
                    new() { Id = 1871, Name = "EastEnders" },
                    new() { Id = 203744, Name = "Sugar" },
                    new() { Id = 1900, Name = "LIVE with Kelly and Mark" },
                    new() { Id = 226687, Name = "All Elite Wrestling: Collision" },
                    new() { Id = 32608, Name = "Ancient Aliens" },
                    new() { Id = 72649, Name = "Hot Ones" },
                    new() { Id = 3339, Name = "Fair City" }
                ]
            };

            var tvShowListsClientMock = new Mock<ITVShowListsClient>();
            tvShowListsClientMock
                .Setup(x => x.GetAiringTodayTVShowsAsync(2))
                .ReturnsAsync(expected);

            var result = await tv ShowListsClientMock.Object.GetAiringTodayTVShowsAsync(2);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(8).And.BeEquivalentTo(expected.Results);
        }
    }
}
