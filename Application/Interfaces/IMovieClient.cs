using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IMovieClient
    {
        public Task<MovieDto> GetMovieById(int id);
    }
}
