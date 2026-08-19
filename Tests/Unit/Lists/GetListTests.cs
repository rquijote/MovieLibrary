using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Lists
{
    public class GetListTests
    {
        [Fact]
        public async Task GetList_WithMarvelUniverse_ReturnsListDetails()
        {
            var expected = new ListDetailsDto 
            { 
                Id = "1",
                Name = "The Marvel Universe",
                CreatedBy = "travisbell",
                Description = "The idea behind this list is to collect the live action comic book movies from within the Marvel franchise.",
                FavoriteCount = 0,
                ItemCount = 59,
                Items = 
                [
                    new MovieDto { Id = 634649, Title = "Spider-Man: No Way Home" },
                    new MovieDto { Id = 524434, Title = "Eternals" },
                    new MovieDto { Id = 299534, Title = "Avengers: Endgame" }
                ]
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.GetList(1))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.GetList(1);

            result.Should().NotBeNull();
            result.Name.Should().Be("The Marvel Universe");
            result.ItemCount.Should().Be(59);
            result.Items.Should().HaveCount(3);
        }

        [Fact]
        public async Task GetList_WithOscarNominations_ReturnsListDetails()
        {
            var expected = new ListDetailsDto 
            { 
                Id = "2",
                Name = "2012 Oscar Nominations for Best Picture - 84th Academy Awards",
                CreatedBy = "Travis Bell",
                Description = "A list of the films that were nominated at the 2012 Oscars for best picture.",
                FavoriteCount = 0,
                ItemCount = 9,
                Items = 
                [
                    new MovieDto { Id = 74643, Title = "The Artist" },
                    new MovieDto { Id = 50014, Title = "The Help" }
                ]
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.GetList(2))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.GetList(2);

            result.Should().NotBeNull();
            result.Name.Should().Be("2012 Oscar Nominations for Best Picture - 84th Academy Awards");
            result.ItemCount.Should().Be(9);
        }

        [Fact]
        public async Task GetList_WithDCComicsUniverse_ReturnsListDetails()
        {
            var expected = new ListDetailsDto 
            { 
                Id = "3",
                Name = "The DC Comics Universe",
                CreatedBy = "Travis Bell",
                Description = "Here's a list of the films that take place in the DC Comics universe.",
                FavoriteCount = 0,
                ItemCount = 36,
                Items = 
                [
                    new MovieDto { Id = 572802, Title = "Aquaman and the Lost Kingdom" },
                    new MovieDto { Id = 155, Title = "The Dark Knight" }
                ]
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.GetList(3))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.GetList(3);

            result.Should().NotBeNull();
            result.Name.Should().Be("The DC Comics Universe");
            result.ItemCount.Should().Be(36);
        }

        [Fact]
        public async Task GetList_WithInvalidListId_ThrowsException()
        {
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.GetList(999999))
                .ThrowsAsync(new KeyNotFoundException("List not found"));

            var act = async () => await listsClientMock.Object.GetList(999999);

            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("List not found");
        }
    }
}
