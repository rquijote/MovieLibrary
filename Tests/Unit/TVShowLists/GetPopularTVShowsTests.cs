using Application.Interfaces;
using Application.Models.Dto.Requests;
using Moq;
using FluentAssertions;

namespace Tests.Unit.TVShowLists
{
    public class GetPopularTVShowsTests
    {
        [Fact]
        public async Task GetPopularTVShowsAsync_WithDefaultPage_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 94997, Name = "House of the Dragon" },
                    new() { Id = 5920, Name = "The Mentalist" },
                    new() { Id = 2734, Name = "Law & Order: Special Victims Unit" },
                    new() { Id = 79744, Name = "The Rookie" },
                    new() { Id = 60625, Name = "Rick and Morty" },
                    new() { Id = 1416, Name = "Grey's Anatomy" },
                    new() { Id = 124364, Name = "FROM" },
                    new() { Id = 549, Name = "Law & Order" },
                    new() { Id = 1622, Name = "Supernatural" },
                    new() { Id = 125988, Name = "Silo" },
                    new() { Id = 4614, Name = "NCIS" },
                    new() { Id = 22980, Name = "Watch What Happens Live with Andy Cohen" },
                    new() { Id = 1434, Name = "Family Guy" },
                    new() { Id = 65334, Name = "Miraculous: Tales of Ladybug & Cat Noir" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetPopularTVShowsAsync(1))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetPopularTVShowsAsync();

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(14).And.BeEquivalentTo(expected.TVShows);
        }

        [Fact]
        public async Task GetPopularTVShowsAsync_WithSpecificPage_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 4057, Name = "Criminal Minds" },
                    new() { Id = 63770, Name = "The Late Show with Stephen Colbert" },
                    new() { Id = 456, Name = "The Simpsons" },
                    new() { Id = 1399, Name = "Game of Thrones" },
                    new() { Id = 1396, Name = "Breaking Bad" },
                    new() { Id = 108978, Name = "Reacher" },
                    new() { Id = 1408, Name = "House" },
                    new() { Id = 1405, Name = "Dexter" },
                    new() { Id = 34307, Name = "Shameless" },
                    new() { Id = 59941, Name = "The Tonight Show Starring Jimmy Fallon" },
                    new() { Id = 1431, Name = "CSI: Crime Scene Investigation" },
                    new() { Id = 764, Name = "Midsomer Murders" },
                    new() { Id = 61818, Name = "Late Night with Seth Meyers" },
                    new() { Id = 46952, Name = "The Blacklist" },
                    new() { Id = 76479, Name = "The Boys" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetPopularTVShowsAsync(2))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetPopularTVShowsAsync(2);

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(15).And.BeEquivalentTo(expected.TVShows);
        }
    }
}
