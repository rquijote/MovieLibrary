using Application.Interfaces;
using Application.Models.Dto.Requests;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Search
{
    public class SearchTVShowTests
    {
        [Fact]
        public async Task SearchTVShowsAsync_WithHouseQuery_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 1408, Name = "House"},
                    new() { Id = 94997, Name = "House of the Dragon"},
                    new() { Id = 4313, Name = "Full House"}
                ]
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchTVShowsAsync("house"))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchTVShowsAsync("house");

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.TVShows);
        }

        [Fact] 
        public async Task SearchTVShowsAsync_WithLawQuery_ReturnsMatchingShows()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows =
                [
                    new() { Id = 549, Name = "Law & Order"},
                    new() { Id = 2734, Name = "Law & Order: Special Victims Unit"},
                    new() { Id = 4601, Name = "Law & Order: Criminal Intent"}
                ]
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchTVShowsAsync("law"))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchTVShowsAsync("law");

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.TVShows);
        }

        [Fact]
        public async Task SearchTVShowsAsync_WithNoMatchingQuery_ReturnsEmptyResults()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows = []
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchTVShowsAsync("qqqqqqqqq"))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchTVShowsAsync("qqqqqqqqq");

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.BeEmpty();
        }

        [Fact]
        public async Task SearchTVShowsAsync_WithEmptyQuery_ReturnsEmptyResults()
        {
            var expected = new TmdbSearchResponseDto
            {
                TVShows = []
            };

            var searchClientMock = new Mock<ISearchClient>();
            searchClientMock
                .Setup(x => x.SearchTVShowsAsync(""))
                .ReturnsAsync(expected);

            var result = await searchClientMock.Object.SearchTVShowsAsync("");

            result.Should().NotBeNull();
            result.TVShows.Should().NotBeNull().And.BeEmpty();
        }
    }
}
