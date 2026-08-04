using Application.Interfaces;
using Application.Models.Dto.Requests;
using Moq;
using FluentAssertions;

namespace Tests.Unit.TVShowLists
{
    public class GetTopRatedTVShowsTests
    {
        [Fact]
        public async Task GetTopRatedTVShowsAsync_WithDefaultPage_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 130392, Name = "The D'Amelio Show" },
                    new() { Id = 1396, Name = "Breaking Bad" },
                    new() { Id = 94605, Name = "Arcane" },
                    new() { Id = 100088, Name = "The Last of Us" },
                    new() { Id = 60625, Name = "Rick and Morty" },
                    new() { Id = 70785, Name = "Anne with an E" },
                    new() { Id = 95557, Name = "Invincible" },
                    new() { Id = 92685, Name = "The Owl House" },
                    new() { Id = 31132, Name = "Regular Show" },
                    new() { Id = 246, Name = "Avatar: The Last Airbender" },
                    new() { Id = 89456, Name = "Primal" },
                    new() { Id = 76121, Name = "DARLING in the FRANXX" }
                ]
            };

            var tvShowListsClientMock = new Mock<ITVShowListsClient>();
            tvShowListsClientMock
                .Setup(x => x.GetTopRatedTVShowsAsync(1))
                .ReturnsAsync(expected);

            var result = await tvShowListsClientMock.Object.GetTopRatedTVShowsAsync();

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(12).And.BeEquivalentTo(expected.TVShows);
        }

        [Fact]
        public async Task GetTopRatedTVShowsAsync_WithSpecificPage_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 1398, Name = "The Sopranos" },
                    new() { Id = 92685, Name = "The Owl House" },
                    new() { Id = 261145, Name = "The Amazing Digital Circus" },
                    new() { Id = 138502, Name = "X-Men '97" },
                    new() { Id = 89456, Name = "Primal" },
                    new() { Id = 70785, Name = "Anne with an E" },
                    new() { Id = 131378, Name = "Adventure Time: Fionna and Cake" },
                    new() { Id = 68595, Name = "Planet Earth II" },
                    new() { Id = 1430, Name = "Cosmos: A Personal Voyage" },
                    new() { Id = 95557, Name = "Invincible" },
                    new() { Id = 1438, Name = "The Wire" },
                    new() { Id = 74313, Name = "Blue Planet II" },
                    new() { Id = 31132, Name = "Regular Show" }
                ]
            };

            var tvShowListsClientMock = new Mock<ITVShowListsClient>();
            tvShowListsClientMock
                .Setup(x => x.GetTopRatedTVShowsAsync(2))
                .ReturnsAsync(expected);

            var result = await tvShowListsClientMock.Object.GetTopRatedTVShowsAsync(2);

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(13).And.BeEquivalentTo(expected.TVShows);
        }
    }
}
