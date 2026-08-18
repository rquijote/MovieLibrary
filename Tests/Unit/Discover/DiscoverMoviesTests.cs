using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Moq;
using FluentAssertions;

namespace Tests.Unit.Discover
{
    public class DiscoverMoviesTests
    {
        [Fact]
        public async Task DiscoverMoviesAsync_WithDefaultFilters_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 1,
                TotalPages = 500,
                TotalResults = 10000,
                Results =
                [
                    new() { Id = 278, Title = "The Shawshank Redemption" },
                    new() { Id = 238, Title = "The Godfather" },
                    new() { Id = 240, Title = "The Godfather Part II" },
                    new() { Id = 424, Title = "Schindler's List" },
                    new() { Id = 19404, Title = "Dilwale Dulhania Le Jayenge" },
                    new() { Id = 389, Title = "12 Angry Men" },
                    new() { Id = 129, Title = "Spirited Away" },
                    new() { Id = 155, Title = "The Dark Knight" },
                    new() { Id = 496243, Title = "Parasite" },
                    new() { Id = 497, Title = "The Green Mile" }
                ]
            };

            var request = new DiscoverMoviesRequestDto();
            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(r => r.Page == 1)))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Page.Should().Be(1);
            result.TotalPages.Should().Be(500);
            result.Results.Should().NotBeNull().And.HaveCount(10).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverMoviesAsync_WithSpecificPage_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 2,
                TotalPages = 500,
                TotalResults = 10000,
                Results =
                [
                    new() { Id = 680, Title = "Pulp Fiction" },
                    new() { Id = 13, Title = "Forrest Gump" },
                    new() { Id = 769, Title = "GoodFellas" },
                    new() { Id = 637, Title = "Life Is Beautiful" },
                    new() { Id = 122, Title = "The Lord of the Rings: The Return of the King" },
                    new() { Id = 429, Title = "The Good, the Bad and the Ugly" },
                    new() { Id = 346, Title = "Seven Samurai" },
                    new() { Id = 12477, Title = "Grave of the Fireflies" }
                ]
            };

            var request = new DiscoverMoviesRequestDto { Page = 2 };
            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(r => r.Page == 2)))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Page.Should().Be(2);
            result.Results.Should().NotBeNull().And.HaveCount(8).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverMoviesAsync_WithReleaseDateRange_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 1,
                TotalPages = 4725,
                TotalResults = 94490,
                Results =
                [
                    new() { Id = 569094, Title = "Spider-Man: Across the Spider-Verse" },
                    new() { Id = 361743, Title = "Top Gun: Maverick" },
                    new() { Id = 872585, Title = "Oppenheimer" },
                    new() { Id = 453395, Title = "Doctor Strange in the Multiverse of Madness" },
                    new() { Id = 447365, Title = "Guardians of the Galaxy Vol. 3" },
                    new() { Id = 414906, Title = "The Batman" },
                    new() { Id = 385687, Title = "Fast X" },
                    new() { Id = 502356, Title = "The Super Mario Bros. Movie" },
                    new() { Id = 615656, Title = "Meg 2: The Trench" },
                    new() { Id = 713704, Title = "Evil Dead Rise" }
                ]
            };

            var request = new DiscoverMoviesRequestDto
            {
                PrimaryReleaseDateGte = "2022-01-01",
                PrimaryReleaseDateLte = "2024-01-01"
            };

            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(
                    r => r.PrimaryReleaseDateGte == "2022-01-01" && r.PrimaryReleaseDateLte == "2024-01-01")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Page.Should().Be(1);
            result.TotalPages.Should().Be(4725);
            result.TotalResults.Should().Be(94490);
            result.Results.Should().NotBeNull().And.HaveCount(10).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverMoviesAsync_WithLanguageFilter_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 1,
                TotalPages = 100,
                TotalResults = 2000,
                Results =
                [
                    new() { Id = 129, Title = "Spirited Away" },
                    new() { Id = 12477, Title = "Grave of the Fireflies" },
                    new() { Id = 346, Title = "Seven Samurai" },
                    new() { Id = 101, Title = "The Sword of Doom" },
                    new() { Id = 11621, Title = "Throne of Blood" }
                ]
            };

            var request = new DiscoverMoviesRequestDto
            {
                WithOriginalLanguage = "ja"
            };

            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(
                    r => r.WithOriginalLanguage == "ja")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverMoviesAsync_WithRegionFilter_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 1,
                TotalPages = 200,
                TotalResults = 4000,
                Results =
                [
                    new() { Id = 155, Title = "The Dark Knight" },
                    new() { Id = 680, Title = "Pulp Fiction" },
                    new() { Id = 13, Title = "Forrest Gump" },
                    new() { Id = 769, Title = "GoodFellas" },
                    new() { Id = 550, Title = "Fight Club" }
                ]
            };

            var request = new DiscoverMoviesRequestDto
            {
                Region = "US"
            };

            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(
                    r => r.Region == "US")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverMoviesAsync_WithGenreFilter_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 1,
                TotalPages = 150,
                TotalResults = 3000,
                Results =
                [
                    new() { Id = 155, Title = "The Dark Knight" },
                    new() { Id = 27205, Title = "Inception" },
                    new() { Id = 603, Title = "The Matrix" },
                    new() { Id = 120, Title = "The Lord of the Rings: The Fellowship of the Ring" },
                    new() { Id = 299534, Title = "Avengers: Endgame" }
                ]
            };

            var request = new DiscoverMoviesRequestDto
            {
                WithGenres = "28,12" // Action and Adventure genre IDs
            };

            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(
                    r => r.WithGenres == "28,12")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(5).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverMoviesAsync_WithMultipleFilters_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 1,
                TotalPages = 973,
                TotalResults = 19447,
                Results =
                [
                    new() { Id = 577922, Title = "Tenet" },
                    new() { Id = 340102, Title = "The New Mutants" },
                    new() { Id = 454626, Title = "Sonic the Hedgehog" },
                    new() { Id = 613504, Title = "After We Collided" },
                    new() { Id = 508442, Title = "Soul" },
                    new() { Id = 464052, Title = "Wonder Woman 1984" },
                    new() { Id = 38700, Title = "Bad Boys for Life" },
                    new() { Id = 522627, Title = "The Gentlemen" },
                    new() { Id = 446893, Title = "Trolls World Tour" },
                    new() { Id = 524047, Title = "Greenland" }
                ]
            };

            var request = new DiscoverMoviesRequestDto
            {
                Page = 1,
                PrimaryReleaseDateGte = "2020-01-01",
                PrimaryReleaseDateLte = "2021-01-01",
                WithOriginalLanguage = "en",
                SortBy = "popularity.desc"
            };

            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(
                    r => r.Page == 1 &&
                         r.PrimaryReleaseDateGte == "2020-01-01" &&
                         r.PrimaryReleaseDateLte == "2021-01-01" &&
                         r.WithOriginalLanguage == "en" &&
                         r.SortBy == "popularity.desc")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Page.Should().Be(1);
            result.TotalPages.Should().Be(973);
            result.TotalResults.Should().Be(19447);
            result.Results.Should().NotBeNull().And.HaveCount(10).And.BeEquivalentTo(expected.Results);
        }

        [Fact]
        public async Task DiscoverMoviesAsync_WithSortBy_ReturnsMatchingMovies()
        {
            var expected = new MovieListResponseDto
            {
                Page = 1,
                TotalPages = 500,
                TotalResults = 10000,
                Results =
                [
                    new() { Id = 278, Title = "The Shawshank Redemption" },
                    new() { Id = 238, Title = "The Godfather" },
                    new() { Id = 240, Title = "The Godfather Part II" },
                    new() { Id = 424, Title = "Schindler's List" }
                ]
            };

            var request = new DiscoverMoviesRequestDto
            {
                SortBy = "vote_average.desc"
            };

            var discoverClientMock = new Mock<IDiscoverMoviesClient>();
            discoverClientMock
                .Setup(x => x.DiscoverMoviesAsync(It.Is<DiscoverMoviesRequestDto>(
                    r => r.SortBy == "vote_average.desc")))
                .ReturnsAsync(expected);

            var result = await discoverClientMock.Object.DiscoverMoviesAsync(request);

            result.Should().NotBeNull();
            result.Results.Should().NotBeNull().And.HaveCount(4).And.BeEquivalentTo(expected.Results);
        }
    }
}
