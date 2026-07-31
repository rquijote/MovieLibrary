using Application.Interfaces;
using Application.Models.Dto;
using Moq;
using FluentAssertions;

namespace Tests.Unit.TVShowLists
{
    public class GetOnTheAirTVShowsTests
    {
        [Fact]
        public async Task GetOnTheAirTVShowsAsync_WithDefaultPage_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 94997, Name = "House of the Dragon" },
                    new() { Id = 125988, Name = "Silo" },
                    new() { Id = 22980, Name = "Watch What Happens Live with Andy Cohen" },
                    new() { Id = 59941, Name = "The Tonight Show Starring Jimmy Fallon" },
                    new() { Id = 61818, Name = "Late Night with Seth Meyers" },
                    new() { Id = 45140, Name = "Teen Titans Go!" },
                    new() { Id = 2224, Name = "The Daily Show" },
                    new() { Id = 278624, Name = "Lucky" },
                    new() { Id = 91555, Name = "All Elite Wrestling: Dynamite" },
                    new() { Id = 113962, Name = "Lioness" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetOnTheAirTVShowsAsync(1))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetOnTheAirTVShowsAsync();

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(10).And.BeEquivalentTo(expected.TVShows);
        }

        [Fact]
        public async Task GetOnTheAirTVShowsAsync_WithSpecificPage_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 4656, Name = "Raw" },
                    new() { Id = 65701, Name = "Good Mythical Morning" },
                    new() { Id = 138502, Name = "X-Men '97" },
                    new() { Id = 23393, Name = "BBC Proms" },
                    new() { Id = 287620, Name = "Stuart Fails to Save the Universe" },
                    new() { Id = 57532, Name = "PAW Patrol" },
                    new() { Id = 615, Name = "Futurama" },
                    new() { Id = 4419, Name = "Real Time with Bill Maher" },
                    new() { Id = 194583, Name = "The Walking Dead: Dead City" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetOnTheAirTVShowsAsync(2))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetOnTheAirTVShowsAsync(2);

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(9).And.BeEquivalentTo(expected.TVShows);
        }

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetOnTheAirTVShowsAsync(2))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetOnTheAirTVShowsAsync(2);

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(20).And.BeEquivalentTo(expected.TVShows);
        }
    }
}
