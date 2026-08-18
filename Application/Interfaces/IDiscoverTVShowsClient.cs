using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IDiscoverTVShowsClient
    {
        Task<TvShowListResponseDto> DiscoverTVShowsAsync(DiscoverTVShowsRequestDto request);
    }
}
