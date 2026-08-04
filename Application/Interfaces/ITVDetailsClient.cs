using Application.Models.Dto.Requests;

namespace Application.Interfaces
{
    public interface ITVDetailsClient
    {
        Task<object> GetTVShowByIdAsync(int id);
    }
}
