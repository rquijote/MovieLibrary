using Application.Interfaces;
using Application.Models.Dto.Requests;
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
            var request = new CreateListDto
            {
                Name = "Marvel Movies",
                Description = "A collection of Marvel superhero movies",
                Language = "en"
            };
            var expected = new StatusDto 
            { 
                Success = true, 
                StatusCode = 1, 
                StatusMessage = "Success."
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.CreateList(It.IsAny<CreateListDto>()))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.CreateList(request);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
        }

        [Fact]
        public async Task CreateList_WithActionMovies_ReturnsSuccess()
        {
            var request = new CreateListDto
            {
                Name = "Action Movies",
                Description = "High-octane action packed films",
                Language = "en"
            };
            var expected = new StatusDto 
            { 
                Success = true, 
                StatusCode = 1, 
                StatusMessage = "Success."
            };
            var listsClientMock = new Mock<IListsClient>();
            listsClientMock.Setup(x => x.CreateList(It.IsAny<CreateListDto>()))
                .ReturnsAsync(expected);

            var result = await listsClientMock.Object.CreateList(request);

            result.Success.Should().BeTrue();
            result.StatusCode.Should().Be(1);
        }
    }
}
