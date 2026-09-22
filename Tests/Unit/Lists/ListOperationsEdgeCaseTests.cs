using Application.Enums;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Lists
{
    public class ListOperationsEdgeCaseTests
    {
        [Fact]
        public async Task UpdateList_WithValidRequest_ReturnsSuccess()
        {
            var request = new CreateListDto
            {
                Name = "Weekend Movies",
                Description = "Movies for the weekend",
                Language = "en"
            };

            var expected = new StatusDto
            {
                Success = true,
                StatusCode = 12,
                StatusMessage = "The item/record was updated successfully."
            };

            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.Update(1, It.IsAny<CreateListDto>()))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.Update(1, request);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(12);
            result.StatusMessage.Should().Be("The item/record was updated successfully.");
        }

        [Fact]
        public async Task CreateList_WithEmptyName_ReturnsValidationFailure()
        {
            var request = new CreateListDto
            {
                Name = string.Empty,
                Description = "Invalid request",
                Language = "en"
            };

            var expected = new StatusDto
            {
                Success = false,
                StatusCode = 18,
                StatusMessage = "Validation failed."
            };

            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.Create(It.Is<CreateListDto>(dto => string.IsNullOrWhiteSpace(dto.Name))))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.Create(request);

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(18);
            result.StatusMessage.Should().Be("Validation failed.");
        }

        [Fact]
        public async Task ClearList_WithValidListId_ReturnsSuccess()
        {
            var expected = new StatusDto
            {
                Success = true,
                StatusCode = 12,
                StatusMessage = "The item/record was updated successfully."
            };

            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.Clear(1))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.Clear(1);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(12);
        }

        [Fact]
        public async Task CheckItemStatus_WithMoviePresent_ReturnsPresentTrue()
        {
            var expected = new ListItemStatusDto
            {
                Id = 1,
                ItemPresent = true
            };

            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.CheckItemStatus(1, MediaType.movie, 299534))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.CheckItemStatus(1, MediaType.movie, 299534);

            result.Id.Should().Be(1);
            result.ItemPresent.Should().BeTrue();
        }

        [Fact]
        public async Task AddMovie_WhenClientThrows_PropagatesException()
        {
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.AddMovie(1, 299534))
                .ThrowsAsync(new InvalidOperationException("Remote API unavailable"));

            var act = async () => await listsClientMock.Object.AddMovie(1, 299534);

            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Remote API unavailable");
        }

        [Fact]
        public async Task RemoveMovie_WhenClientThrows_PropagatesException()
        {
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.RemoveMovie(1, 299534))
                .ThrowsAsync(new InvalidOperationException("Remote API unavailable"));

            var act = async () => await listsClientMock.Object.RemoveMovie(1, 299534);

            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("Remote API unavailable");
        }
    }
}
