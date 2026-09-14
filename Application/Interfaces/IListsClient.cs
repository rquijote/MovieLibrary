using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Application.Interfaces
{
    public interface IListsClient
    {
        public Task<ListStatusDto> CreateList(CreateListDto request);
        public Task<StatusDto> DeleteList(int listId);
        public Task<ListDetailsDto> GetList(int listId);

        // TMDB v4 Lists
        public Task<V4ListDetailsDto> GetDetails(int listId);
        public Task<StatusDto> AddItems(int listId, V4ListItemsRequestDto request);
        public Task<StatusDto> Clear(int listId);
        public Task<V4ListItemStatusDto> GetItemStatus(int listId, MediaType mediaType, int mediaId);
        public Task<StatusDto> RemoveItems(int listId, V4ListItemsRequestDto request);
        public Task<StatusDto> Update(int listId, UpdateListDto request);
        public Task<StatusDto> UpdateItems(int listId, V4ListItemsRequestDto request);

        // Only movies are able to be removed with v3 of list.
        public Task<StatusDto> RemoveMovie(int listId, int mediaId);
        public Task<StatusDto> AddMovie(int listId, int mediaId);
    }
}
