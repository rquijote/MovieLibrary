using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ITvShowClient
    {
        public Task<TvShowDto> GetTvShowById(int id);
        public Task<StatusDto> AddRatingTvShow(int id, double rating);
        public Task<StatusDto> DeleteRatingTvShow(int id);
    }
}
