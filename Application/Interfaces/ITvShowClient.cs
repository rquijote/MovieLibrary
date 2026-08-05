using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ITvShowClient
    {
        public Task<TvShowDto> GetTvShowById(int id);
    }
}
