using Application.Interfaces;
using Application.Models.Dto.Responses;
using FluentAssertions;
using Moq;

namespace Tests.Unit.Rating
{
    public class AddRatingTvShowTests
    {
        [Fact]
        public async Task AddRating_WithSweetTooth_ReturnsSuccess()
        {
            var expected = new StatusDto { StatusCode = 1, StatusMessage = "Success." };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.AddRatingTvShow(103768, 9.0))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.AddRatingTvShow(103768, 9.0);

            result.Should().Be(expected);
        }

        [Fact]
        public async Task AddRating_WithTheMandalorian_ReturnsSuccess()
        {
            var expected = new StatusDto { StatusCode = 1, StatusMessage = "Success." };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.AddRatingTvShow(82856, 9.5))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.AddRatingTvShow(82856, 9.5);

            result.Should().Be(expected);
        }

        [Fact]
        public async Task AddRating_WithTedLasso_ReturnsSuccess()
        {
            var expected = new StatusDto { StatusCode = 1, StatusMessage = "Success." };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.AddRatingTvShow(97546, 8.0))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.AddRatingTvShow(97546, 8.0);

            result.Should().Be(expected);
        }

        [Fact]
        public async Task AddRating_WithRatingAbove10_ReturnsError()
        {
            var expected = new StatusDto { Success = false, StatusCode = 18, StatusMessage = "Value too high: Value must be less than, or equal to 10.0" };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.AddRatingTvShow(103768, 11.0))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.AddRatingTvShow(103768, 11.0);

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(18);
            result.StatusMessage.Should().Be("Value too high: Value must be less than, or equal to 10.0");
        }

        [Fact]
        public async Task AddRating_WithRatingBelow05_ReturnsError()
        {
            var expected = new StatusDto { Success = false, StatusCode = 18, StatusMessage = "Value too low: Value must be greater than 0.0" };
            var tvShowClientMock = new Mock<ITvShowClient>();
            tvShowClientMock.Setup(x => x.AddRatingTvShow(103768, 0.4))
                .ReturnsAsync(expected);

            var result = await tvShowClientMock.Object.AddRatingTvShow(103768, 0.4);

            result.Success.Should().BeFalse();
            result.StatusCode.Should().Be(18);
            result.StatusMessage.Should().Be("Value too low: Value must be greater than 0.0");
        }
    }
}
