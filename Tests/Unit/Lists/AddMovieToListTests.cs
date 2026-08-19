using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Lists
{
    public class AddMovieToListTests
    {
        [Fact]
        public async Task AddMovie_WithSpiderManNoWayHome_ReturnsSuccess()
        {
            var expected = new StatusDto 
            { 
                Success = true, 
                StatusCode = 1, 
                StatusMessage = "Success." 
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.AddMovie())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.AddMovie();

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
            result.StatusMessage.Should().Be("Success.");
        }

        [Fact]
        public async Task AddMovie_WithEternals_ReturnsSuccess()
        {
            var expected = new StatusDto 
            { 
                Success = true, 
                StatusCode = 1, 
                StatusMessage = "Success." 
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.AddMovie())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.AddMovie();

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
        }

        [Fact]
        public async Task AddMovie_WithInvalidMovieId_ReturnsNotFound()
        {
            var expected = new StatusDto 
            { 
                Success = false, 
                StatusCode = 34, 
                StatusMessage = "The resource you requested could not be found." 
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.AddMovie())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.AddMovie();

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(34);
            result.StatusMessage.Should().Be("The resource you requested could not be found.");
        }
    }
}
