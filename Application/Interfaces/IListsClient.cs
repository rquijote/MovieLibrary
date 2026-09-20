using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Application.Interfaces
{
    public interface IListsClient
    {
        public Task<StatusDto> Create(CreateListDto request);
        public Task<StatusDto> Delete(int listId);
        public Task<ListDetailsDto> Details(int listId);
        public Task<StatusDto> RemoveMovie(int listId, int mediaId);
        public Task<StatusDto> AddMovie(int listId, int mediaId);
        public Task<ListItemStatusDto> CheckItemStatus(int listId, MediaType mediaType, int mediaId);
        public Task<StatusDto> Clear(int listId);
    }
}
