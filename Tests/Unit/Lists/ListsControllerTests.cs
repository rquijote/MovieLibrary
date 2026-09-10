using Api.Controllers;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Tests.Unit.Lists
{
    public class ListsControllerTests
    {
        [Fact]
        public async Task AddMovie_UsesMediaIdFromRequestBody()
        {
            var expected = new StatusDto { Success = true, StatusCode = 1, StatusMessage = "Success." };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock
                .Setup(x => x.AddMovie(42, 634649))
                .ReturnsAsync(expected);

            var controller = new ListsController(listsClientMock.Object);
            var result = await controller.AddMovie(42, new ListMediaItemDto { MediaId = 634649 });

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expected);
            listsClientMock.Verify(x => x.AddMovie(42, 634649), Times.Once);
        }

        [Fact]
        public async Task RemoveMovie_UsesMediaIdFromRequestBody()
        {
            var expected = new StatusDto { Success = true, StatusCode = 13, StatusMessage = "The item/record was deleted successfully." };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock
                .Setup(x => x.RemoveMovie(42, 634649))
                .ReturnsAsync(expected);

            var controller = new ListsController(listsClientMock.Object);
            var result = await controller.RemoveMovie(42, new ListMediaItemDto { MediaId = 634649 });

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expected);
            listsClientMock.Verify(x => x.RemoveMovie(42, 634649), Times.Once);
        }
    }
}
