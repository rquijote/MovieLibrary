using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Moq;
using FluentAssertions;

namespace Tests.Unit.MovieLists
{
    public class GetNowPlayingMoviesTests
    {
        [Fact]
        public async Task GetNowPlayingMoviesAsync_WithDefaultPage_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Results =
                [
                    new() { Id = 1368337, Title = "The Odyssey" },
                    new() { Id = 969681, Title = "Spider-Man: Brand New Day" },
                    new() { Id = 1081003, Title = "Supergirl" },
                    new() { Id = 1108427, Title = "Moana" },
                    new() { Id = 1339713, Title = "Obsession" },
                    new() { Id = 1284465, Title = "The Death of Robin Hood" },
                    new() { Id = 1084244, Title = "Toy Story 5" },
                    new() { Id = 980431, Title = "Avatar Aang: The Last Airbender" },
                    new() { Id = 1083381, Title = "Backrooms" },
                    new() { Id = 1315772, Title = "Minions & Monsters" },
                    new() { Id = 1727780, Title = "Borderline" },
                    new() { Id = 634649, Title = "Spider-Man: No Way Home" },
                    new() { Id = 1273221, Title = "Scary Movie" },
                    new() { Id = 1127384, Title = "Deep Water" },
                    new() { Id = 949838, Title = "72 HOURS" },
                    new() { Id = 1318621, Title = "Descendants: Wicked Wonderland" }
                ]
            };

            var movieListsClientMock = new Mock<IMovieListsClient>();
            movieListsClientMock
                .Setup(x => x.GetNowPlayingMoviesAsync(1))
                .ReturnsAsync(expected);

            var result = await movieListsClientMock.Object.GetNowPlayingMoviesAsync();

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(16).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task GetNowPlayingMoviesAsync_WithSpecificPage_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Results =
                [
                    new() { Id = 1481343, Title = "The Devil's Mouth" },
                    new() { Id = 1430698, Title = "The Bay" },
                    new() { Id = 1382832, Title = "Hungry" },
                    new() { Id = 1469342, Title = "Her Private Hell" },
                    new() { Id = 1361774, Title = "The Dink" },
                    new() { Id = 1368314, Title = "Passenger" },
                    new() { Id = 1564614, Title = "Leviticus" },
                    new() { Id = 1212763, Title = "Evil Dead Burn" },
                    new() { Id = 1321008, Title = "Black Box" },
                    new() { Id = 603, Title = "The Matrix" },
                    new() { Id = 840464, Title = "Greenland 2: Migration" },
                    new() { Id = 1430077, Title = "Hokum" }
                ]
            };

            var movieListsClientMock = new Mock<IMovieListsClient>();
            movieListsClientMock
                .Setup(x => x.GetNowPlayingMoviesAsync(2))
                .ReturnsAsync(expected);

            var result = await movieListsClientMock.Object.GetNowPlayingMoviesAsync(2);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(12).And.BeEquivalentTo(expected.Results);
        }
    }
}
