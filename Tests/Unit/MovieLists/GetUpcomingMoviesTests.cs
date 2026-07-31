using Application.Interfaces;
using Application.Models.Dto;
using Moq;
using FluentAssertions;

namespace Tests.Unit.MovieLists
{
    public class GetUpcomingMoviesTests
    {
        [Fact]
        public async Task GetUpcomingMoviesAsync_WithDefaultPage_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 1368337, Title = "The Odyssey" },
                    new() { Id = 969681, Title = "Spider-Man: Brand New Day" },
                    new() { Id = 1108427, Title = "Moana" },
                    new() { Id = 1339713, Title = "Obsession" },
                    new() { Id = 1284465, Title = "The Death of Robin Hood" },
                    new() { Id = 1315772, Title = "Minions & Monsters" },
                    new() { Id = 1127384, Title = "Deep Water" },
                    new() { Id = 1469342, Title = "Her Private Hell" },
                    new() { Id = 1564614, Title = "Leviticus" },
                    new() { Id = 1516698, Title = "The Last Sunrise" },
                    new() { Id = 1122573, Title = "In the Grey" },
                    new() { Id = 1325734, Title = "The Drama" },
                    new() { Id = 1430077, Title = "Hokum" },
                    new() { Id = 950028, Title = "The Invite" },
                    new() { Id = 1279493, Title = "The Get Out" },
                    new() { Id = 1101383, Title = "The End of Oak Street" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetUpcomingMoviesAsync(1))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetUpcomingMoviesAsync();

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(16).And.BeEquivalentTo(expected.Movies);
        }

        [Fact]
        public async Task GetUpcomingMoviesAsync_WithSpecificPage_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 1541560, Title = "Stop! That! Train!" },
                    new() { Id = 1480387, Title = "undertone" },
                    new() { Id = 1266127, Title = "Ready or Not: Here I Come" },
                    new() { Id = 11036, Title = "The Notebook" },
                    new() { Id = 1318413, Title = "Pressure" },
                    new() { Id = 1363387, Title = "Saccharine" },
                    new() { Id = 87513, Title = "Motor City" },
                    new() { Id = 313369, Title = "La La Land" },
                    new() { Id = 1242265, Title = "Fuze" },
                    new() { Id = 564, Title = "The Mummy Returns" },
                    new() { Id = 1241436, Title = "Warfare" },
                    new() { Id = 414419, Title = "Kill Bill: The Whole Bloody Affair" },
                    new() { Id = 1185806, Title = "PAW Patrol: The Dino Movie" },
                    new() { Id = 50619, Title = "The Twilight Saga: Breaking Dawn - Part 1" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetUpcomingMoviesAsync(2))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetUpcomingMoviesAsync(2);

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(14).And.BeEquivalentTo(expected.Movies);
        }
    }
}
