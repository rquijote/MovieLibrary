using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IDiscoverMoviesClient
    {
        Task<MovieListResponseDto> DiscoverMoviesAsync(DiscoverMoviesRequestDto request);
    }
}
