using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Moq;
using FluentAssertions;

namespace Tests.Unit.Discover
{
    public class DiscoverTVShowsTests
    {
        [Fact]
        public async Task DiscoverTVShowsAsync_WithDefaultFilters_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 1,
                TotalPages = 500,
                TotalResults = 10000,
                Results =
                [
                    new() { Id = 1396, Name = "Breaking Bad" },
                    new() { Id = 60625, Name = "Rick and Morty" },
                    new() { Id = 94605, Name = "Arcane" },
                    new() { Id = 1402, Name = "The Walking Dead" },
                    new() { Id = 82856, Name = "The Mandalorian" },
                    new() { Id = 85271, Name = "WandaVision" },
                    new() { Id = 88396, Name = "The Falcon and the Winter Soldier" },
                    new() { Id = 95557, Name = "Invincible" },
                    new() { Id = 84958, Name = "Loki" },
                    new() { Id = 1399, Name = "Game of Thrones" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto();
            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(r => r.Page == 1)))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Page.Should().Be(1);
            result.TotalPages.Should().Be(500);
            result.Results.Should().NotBeNull().And.HaveCount(10).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverTVShowsAsync_WithSpecificPage_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 2,
                TotalPages = 500,
                TotalResults = 10000,
                Results =
                [
                    new() { Id = 1668, Name = "Friends" },
                    new() { Id = 456, Name = "The Simpsons" },
                    new() { Id = 31911, Name = "Futurama" },
                    new() { Id = 73375, Name = "Sex Education" },
                    new() { Id = 63174, Name = "Lucifer" },
                    new() { Id = 60574, Name = "Peaky Blinders" },
                    new() { Id = 46952, Name = "The Witcher" },
                    new() { Id = 71712, Name = "The Good Place" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto { Page = 2 };
            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(r => r.Page == 2)))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Page.Should().Be(2);
            result.Results.Should().NotBeNull().And.HaveCount(8).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverTVShowsAsync_WithAirDateRange_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 1,
                TotalPages = 50,
                TotalResults = 1000,
                Results =
                [
                    new() { Id = 94605, Name = "Arcane" },
                    new() { Id = 88329, Name = "Hawkeye" },
                    new() { Id = 115036, Name = "The Last of Us" },
                    new() { Id = 114410, Name = "Wednesday" },
                    new() { Id = 92782, Name = "The Book of Boba Fett" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto
            {
                FirstAirDateGte = "2021-01-01",
                FirstAirDateLte = "2023-12-31"
            };

            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(
                    r => r.FirstAirDateGte == "2021-01-01" && r.FirstAirDateLte == "2023-12-31")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverTVShowsAsync_WithLanguageFilter_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 1,
                TotalPages = 100,
                TotalResults = 2000,
                Results =
                [
                    new() { Id = 67915, Name = "Attack on Titan" },
                    new() { Id = 46260, Name = "Naruto Shippūden" },
                    new() { Id = 1429, Name = "Attack on Titan" },
                    new() { Id = 85937, Name = "Demon Slayer: Kimetsu no Yaiba" },
                    new() { Id = 37854, Name = "One Piece" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto
            {
                WithOriginalLanguage = "ja"
            };

            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(
                    r => r.WithOriginalLanguage == "ja")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverTVShowsAsync_WithGenreFilter_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 1,
                TotalPages = 150,
                TotalResults = 3000,
                Results =
                [
                    new() { Id = 60625, Name = "Rick and Morty" },
                    new() { Id = 94605, Name = "Arcane" },
                    new() { Id = 95557, Name = "Invincible" },
                    new() { Id = 85937, Name = "Demon Slayer: Kimetsu no Yaiba" },
                    new() { Id = 67915, Name = "Attack on Titan" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto
            {
                WithGenres = "16,10765" // Animation and Sci-Fi & Fantasy genre IDs
            };

            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(
                    r => r.WithGenres == "16,10765")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverTVShowsAsync_WithNetworkFilter_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 1,
                TotalPages = 100,
                TotalResults = 2000,
                Results =
                [
                    new() { Id = 1399, Name = "Game of Thrones" },
                    new() { Id = 1402, Name = "The Walking Dead" },
                    new() { Id = 60574, Name = "Peaky Blinders" },
                    new() { Id = 71712, Name = "The Good Place" },
                    new() { Id = 1668, Name = "Friends" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto
            {
                WithNetworks = "49" // HBO network ID
            };

            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(
                    r => r.WithNetworks == "49")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverTVShowsAsync_WithMultipleFilters_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 1,
                TotalPages = 20,
                TotalResults = 400,
                Results =
                [
                    new() { Id = 82856, Name = "The Mandalorian" },
                    new() { Id = 114410, Name = "Wednesday" },
                    new() { Id = 115036, Name = "The Last of Us" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto
            {
                Page = 1,
                FirstAirDateGte = "2020-01-01",
                FirstAirDateLte = "2024-12-31",
                WithOriginalLanguage = "en",
                WithGenres = "10765",
                SortBy = "popularity.desc"
            };

            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(
                    r => r.Page == 1 &&
                         r.FirstAirDateGte == "2020-01-01" &&
                         r.FirstAirDateLte == "2024-12-31" &&
                         r.WithOriginalLanguage == "en" &&
                         r.WithGenres == "10765" &&
                         r.SortBy == "popularity.desc")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(3).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverTVShowsAsync_WithSortBy_ReturnsMatchingShows()
        {
            var expected = new TvShowListResponseDto
            {
                Page = 1,
                TotalPages = 500,
                TotalResults = 10000,
                Results =
                [
                    new() { Id = 1396, Name = "Breaking Bad" },
                    new() { Id = 60625, Name = "Rick and Morty" },
                    new() { Id = 94605, Name = "Arcane" },
                    new() { Id = 1399, Name = "Game of Thrones" }
                ]
            };

            var request = new DiscoverTVShowsRequestDto
            {
                SortBy = "vote_average.desc"
            };

            var discoverClientMock = new Mock<IDiscoverTVShowsClient>();
            discoverClientMock
                .Setup(x => x.DiscoverTVShowsAsync(It.Is<DiscoverTVShowsRequestDto>(
                    r => r.SortBy == "vote_average.desc")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverTVShowsAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(4).And.BeEquivalentTo(expected.Results);
        }
    }
}
