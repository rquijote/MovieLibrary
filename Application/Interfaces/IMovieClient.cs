using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IMovieClient
    {
        public Task<object> GetMovieById(int id);
        public Task<StatusDto> AddRatingMovie(int id, double rating);
        public Task<StatusDto> DeleteRatingMovie(int id);
    }
}
