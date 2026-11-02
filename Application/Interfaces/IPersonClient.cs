using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IPersonClient
    {
        Task<PersonDetailsDto> GetPersonById(int id);
    }
}
