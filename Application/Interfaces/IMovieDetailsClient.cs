using Application.Models.Dto.Requests;

namespace Application.Interfaces
{
    public interface IMovieDetailsClient
    {
        Task<object> GetMovieByIdAsync(int id);
    }
}
