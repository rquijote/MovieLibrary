using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Rating
{
    public class DeleteRatingTvShowTests
    {
        [Fact]
        public async Task DeleteRating_WithSweetTooth_ReturnsSuccess()
        {
            var expected = new StatusDto { Success = true, StatusCode = 13, StatusMessage = "The item/record was deleted successfully." };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.DeleteRatingTvShow(103768))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.DeleteRatingTvShow(103768);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
            result.StatusMessage.Should().Be("The item/record was deleted successfully.");
        }

        [Fact]
        public async Task DeleteRating_WithTheMandalorian_ReturnsSuccess()
        {
            var expected = new StatusDto { Success = true, StatusCode = 13, StatusMessage = "The item/record was deleted successfully." };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.DeleteRatingTvShow(82856))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.DeleteRatingTvShow(82856);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
            result.StatusMessage.Should().Be("The item/record was deleted successfully.");
        }

        [Fact]
        public async Task DeleteRating_WithInvalidTvShowId_ReturnsNotFound()
        {
            var expected = new StatusDto { Success = false, StatusCode = 34, StatusMessage = "The resource you requested could not be found." };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.DeleteRatingTvShow(999999))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.DeleteRatingTvShow(999999);

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(34);
            result.StatusMessage.Should().Be("The resource you requested could not be found.");
        }
    }
}
