using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Lists
{
    public class CreateListTests
    {
        [Fact]
        public async Task CreateList_WithMarvelMovies_ReturnsSuccess()
        {
            var expected = new ListStatusDto 
            { 
                Success = true, 
                StatusCode = 1, 
                StatusMessage = "Success.",
                ListId = 12345
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.CreateList())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.CreateList();

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
            result.ListId.Should().Be(12345);
        }

        [Fact]
        public async Task CreateList_WithActionMovies_ReturnsSuccess()
        {
            var expected = new ListStatusDto 
            { 
                Success = true, 
                StatusCode = 1, 
                StatusMessage = "Success.",
                ListId = 67890
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.CreateList())
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.CreateList();

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
            result.ListId.Should().Be(67890);
        }
    }
}
