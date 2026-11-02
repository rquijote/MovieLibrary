using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface ICollectionClient
    {
        Task<MovieCollectionDto> GetCollectionById(int id);
    }
}
