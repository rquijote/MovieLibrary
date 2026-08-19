using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IListsClient
    {
        public Task<ListStatusDto> CreateList(CreateListDto request);
        public Task<StatusDto> DeleteList(int listId);
        public Task<ListDetailsDto> GetList(int listId);
        // Only movies are able to be removed with v3 of list.
        public Task<StatusDto> RemoveMovie(int listId, int mediaId);
        public Task<StatusDto> AddMovie(int listId, int mediaId);
    }
}
