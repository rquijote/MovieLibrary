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
        public async Task AddMovie_WithMediaRequestBody_UsesMediaIdFromDto()
        {
            const int listId = 123;
            const int mediaId = 11;
            var expected = new StatusDto { Success = true, StatusCode = 1, StatusMessage = "Success." };
            var mockClient = new Mock<IListsClient>();
            mockClient.Setup(client => client.AddMovie(listId, mediaId)).ReturnsAsync(expected);

            var controller = new ListsController(mockClient.Object);

            var result = await controller.AddMovie(listId, new ListMediaItemDto { MediaId = mediaId });

            result.Should().BeOfType<OkObjectResult>();
            mockClient.Verify(client => client.AddMovie(listId, mediaId), Times.Once);
        }

        [Fact]
        public async Task RemoveMovie_WithMediaRequestBody_UsesMediaIdFromDto()
        {
            const int listId = 123;
            const int mediaId = 11;
            var expected = new StatusDto { Success = true, StatusCode = 13, StatusMessage = "The item/record was deleted successfully." };
            var mockClient = new Mock<IListsClient>();
            mockClient.Setup(client => client.RemoveMovie(listId, mediaId)).ReturnsAsync(expected);

            var controller = new ListsController(mockClient.Object);

            var result = await controller.RemoveMovie(listId, new ListMediaItemDto { MediaId = mediaId });

            result.Should().BeOfType<OkObjectResult>();
            mockClient.Verify(client => client.RemoveMovie(listId, mediaId), Times.Once);
        }
    }
}
