using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Rating
{
    public class DeleteRatingMovieTests
    {
        [Fact]
        public async Task DeleteRating_WithAntManQuantumania_ReturnsSuccess()
        {
            var expected = new StatusDto { Success = true, StatusCode = 13, StatusMessage = "The item/record was deleted successfully." };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.DeleteRatingMovie(640146))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.DeleteRatingMovie(640146);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
            result.StatusMessage.Should().Be("The item/record was deleted successfully.");
        }

        [Fact]
        public async Task DeleteRating_WithScreamVI_ReturnsSuccess()
        {
            var expected = new StatusDto { Success = true, StatusCode = 13, StatusMessage = "The item/record was deleted successfully." };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.DeleteRatingMovie(934433))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.DeleteRatingMovie(934433);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(13);
            result.StatusMessage.Should().Be("The item/record was deleted successfully.");
        }

        [Fact]
        public async Task DeleteRating_WithInvalidMovieId_ReturnsNotFound()
        {
            var expected = new StatusDto { Success = false, StatusCode = 34, StatusMessage = "The resource you requested could not be found." };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.DeleteRatingMovie(999999))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.DeleteRatingMovie(999999);

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(34);
            result.StatusMessage.Should().Be("The resource you requested could not be found.");
        }
    }
}
