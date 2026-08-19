using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IListsClient
    {
        public Task<ListStatusDto> CreateList();
        public Task<StatusDto> DeleteList();
        public Task<ListDetailsDto> GetList();
        // Only movies are able to be removed with v3 of list.
        public Task<StatusDto> RemoveMovie();
        public Task<StatusDto> AddMovie();
    }
}
