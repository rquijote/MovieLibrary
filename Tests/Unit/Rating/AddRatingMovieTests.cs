using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Rating
{
    public class AddRatingMovieTests
    {
        [Fact]
        public async Task AddRating_WithAntManQuantumania_ReturnsSuccess()
        {
            var expected = new StatusDto { StatusCode = 1, StatusMessage = "Success." };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.AddRatingMovie(640146, 0.5))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.AddRatingMovie(640146, 0.5);

            result.Should().Be(expected);
        }

        [Fact]
        public async Task AddRating_WithScreamVI_ReturnsSuccess()
        {
            var expected = new StatusDto { StatusCode = 1, StatusMessage = "Success." };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.AddRatingMovie(934433, 8.5))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.AddRatingMovie(934433, 8.5);

            result.Should().Be(expected);
        }

        [Fact]
        public async Task AddRating_WithSuperMarioBrosMovie_ReturnsSuccess()
        {
            var expected = new StatusDto { StatusCode = 1, StatusMessage = "Success." };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.AddRatingMovie(502356, 7.0))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.AddRatingMovie(502356, 7.0);

            result.Should().Be(expected);
        }

        [Fact]
        public async Task AddRating_WithRatingAbove10_ReturnsError()
        {
            var expected = new StatusDto { Success = false, StatusCode = 18, StatusMessage = "Value too high: Value must be less than, or equal to 10.0" };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.AddRatingMovie(640146, 10.5))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.AddRatingMovie(640146, 10.5);

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(18);
            result.StatusMessage.Should().Be("Value too high: Value must be less than, or equal to 10.0");
        }

        [Fact]
        public async Task AddRating_WithRatingBelow05_ReturnsError()
        {
            var expected = new StatusDto { Success = false, StatusCode = 18, StatusMessage = "Value too low: Value must be greater than 0.0" };
            var movieClientMock = new Mock<IMovieClient>();
            movieClientMock.Setup(x => x.AddRatingMovie(640146, 0.3))
                .ReturnsAsync(expected);

            var result = await movieClientMock.Object.AddRatingMovie(640146, 0.3);

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(18);
            result.StatusMessage.Should().Be("Value too low: Value must be greater than 0.0");
        }
    }
}
