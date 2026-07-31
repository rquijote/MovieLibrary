using Application.Interfaces;
using Application.Models.Dto;
using Moq;
using FluentAssertions;

namespace Tests.Unit.MovieLists
{
    public class GetPopularMoviesTests
    {
        [Fact]
        public async Task GetPopularMoviesAsync_WithDefaultPage_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 640146, Title = "Ant-Man and the Wasp: Quantumania" },
                    new() { Id = 502356, Title = "The Super Mario Bros. Movie" },
                    new() { Id = 594767, Title = "Shazam! Fury of the Gods" },
                    new() { Id = 76600, Title = "Avatar: The Way of Water" },
                    new() { Id = 948713, Title = "The Last Kingdom: Seven Kings Must Die" },
                    new() { Id = 677179, Title = "Creed III" },
                    new() { Id = 638974, Title = "Murder Mystery 2" },
                    new() { Id = 713704, Title = "Evil Dead Rise" },
                    new() { Id = 315162, Title = "Puss in Boots: The Last Wish" },
                    new() { Id = 603692, Title = "John Wick: Chapter 4" },
                    new() { Id = 1048300, Title = "Adrenaline" },
                    new() { Id = 804150, Title = "Cocaine Bear" },
                    new() { Id = 1104040, Title = "Gangs of Lagos" },
                    new() { Id = 700391, Title = "65" },
                    new() { Id = 758323, Title = "The Pope's Exorcist" },
                    new() { Id = 842945, Title = "Supercell" },
                    new() { Id = 1033219, Title = "Attack on Titan" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetPopularMoviesAsync(1))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetPopularMoviesAsync();

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(17).And.BeEquivalentTo(expected.Movies);
        }

        [Fact]
        public async Task GetPopularMoviesAsync_WithSpecificPage_ReturnsMatchingMovies()
        {
            var expected = new TmdbSearchResponseDto
            {
                Movies =
                [
                    new() { Id = 1273221, Title = "Scary Movie" },
                    new() { Id = 1314481, Title = "The Devil Wears Prada 2" },
                    new() { Id = 1228710, Title = "The Mandalorian and Grogu" },
                    new() { Id = 1127384, Title = "Deep Water" },
                    new() { Id = 949838, Title = "72 HOURS" },
                    new() { Id = 936075, Title = "Michael" },
                    new() { Id = 1698856, Title = "Master of the Universe" },
                    new() { Id = 1318621, Title = "Descendants: Wicked Wonderland" },
                    new() { Id = 931285, Title = "Mortal Kombat II" },
                    new() { Id = 1481343, Title = "The Devil's Mouth" },
                    new() { Id = 83533, Title = "Avatar: Fire and Ash" },
                    new() { Id = 1430698, Title = "The Bay" },
                    new() { Id = 1226863, Title = "The Super Mario Galaxy Movie" },
                    new() { Id = 278, Title = "The Shawshank Redemption" }
                ]
            };

            var tmdbClientMock = new Mock<ITmdbClient>();
            tmdbClientMock
                .Setup(x => x.GetPopularMoviesAsync(2))
                .ReturnsAsync(expected);

            var result = await tmdbClientMock.Object.GetPopularMoviesAsync(2);

            result.Should().NotBeNull();
            result.Movies.Should().NotBeNull().And.HaveCount(14).And.BeEquivalentTo(expected.Movies);
        }
    }
}
