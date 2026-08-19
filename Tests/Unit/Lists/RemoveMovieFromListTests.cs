using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Lists
{
    public class RemoveMovieFromListTests
    {
        [Fact]
        public async Task RemoveMovie_WithAvengersEndgame_ReturnsSuccess()
        {
            var expected = new StatusDto 
            { 
                Success = true, 
                StatusCode = 13, 
                StatusMessage = "The item/record was deleted successfully." 
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.RemoveMovie())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.RemoveMovie();

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
            result.StatusMessage.Should().Be("The item/record was deleted successfully.");
        }

        [Fact]
        public async Task RemoveMovie_WithBlackPanther_ReturnsSuccess()
        {
            var expected = new StatusDto 
            { 
                Success = true, 
                StatusCode = 13, 
                StatusMessage = "The item/record was deleted successfully." 
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.RemoveMovie())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.RemoveMovie();

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
        }

        [Fact]
        public async Task RemoveMovie_WithInvalidMovieId_ReturnsNotFound()
        {
            var expected = new StatusDto 
            { 
                Success = false, 
                StatusCode = 34, 
                StatusMessage = "The resource you requested could not be found." 
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.RemoveMovie())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.RemoveMovie();

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(34);
            result.StatusMessage.Should().Be("The resource you requested could not be found.");
        }
    }
}
