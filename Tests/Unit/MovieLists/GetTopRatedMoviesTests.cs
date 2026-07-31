using Application.Interfaces;
using Application.Models.Dto.Requests;
using Moq;
using FluentAssertions;

namespace Tests.Unit.MovieLists
{
    public class GetTopRatedMoviesTests
    {
        [Fact]
        public async Task GetTopRatedMoviesAsync_WithDefaultPage_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 980431, Title = "Avatar Aang: The Last Airbender" },
                    new() { Id = 1007757, Title = "Swapped" },
                    new() { Id = 278, Title = "The Shawshank Redemption" },
                    new() { Id = 936075, Title = "Michael" },
                    new() { Id = 238, Title = "The Godfather" },
                    new() { Id = 687163, Title = "Project Hail Mary" },
                    new() { Id = 240, Title = "The Godfather Part II" },
                    new() { Id = 424, Title = "Schindler's List" },
                    new() { Id = 389, Title = "12 Angry Men" },
                    new() { Id = 155, Title = "The Dark Knight" },
                    new() { Id = 497, Title = "The Green Mile" },
                    new() { Id = 122, Title = "The Lord of the Rings: The Return of the King" },
                    new() { Id = 1330021, Title = "Remarkably Bright Creatures" },
                    new() { Id = 157336, Title = "Interstellar" },
                    new() { Id = 680, Title = "Pulp Fiction" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetTopRatedMoviesAsync(1))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetTopRatedMoviesAsync();

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(15).And.BeEquivalentTo(expected.Movies);
        }

        [Fact]
        public async Task GetTopRatedMoviesAsync_WithSpecificPage_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 1383731, Title = "Protector" },
                    new() { Id = 13, Title = "Forrest Gump" },
                    new() { Id = 769, Title = "GoodFellas" },
                    new() { Id = 120, Title = "The Lord of the Rings: The Fellowship of the Ring" },
                    new() { Id = 550, Title = "Fight Club" },
                    new() { Id = 121, Title = "The Lord of the Rings: The Two Towers" },
                    new() { Id = 539, Title = "Psycho" },
                    new() { Id = 510, Title = "One Flew Over the Cuckoo's Nest" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetTopRatedMoviesAsync(2))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetTopRatedMoviesAsync(2);

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(8).And.BeEquivalentTo(expected.Movies);
        }
    }
}
