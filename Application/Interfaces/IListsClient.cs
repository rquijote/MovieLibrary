using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Application.Enums;

namespace Application.Interfaces
{
    public interface IListsClient
    {
        public Task<StatusDto> CreateList(CreateListDto request);
        public Task<StatusDto> DeleteList(int listId);
        public Task<ListDetailsDto> GetList(int listId);

        // TMDB v3 Lists
        public Task<ListDetailsSummaryDto> GetDetails(int listId);
        public Task<StatusDto> AddItems(int listId, ListItemsRequestDto request);
        public Task<StatusDto> Clear(int listId);
        public Task<ListItemStatusDto> GetItemStatus(int listId, MediaType mediaType, int mediaId);
        public Task<StatusDto> RemoveItems(int listId, ListItemsRequestDto request);
        public Task<StatusDto> Update(int listId, UpdateListDto request);
        public Task<StatusDto> UpdateItems(int listId, ListItemsRequestDto request);

        // Only movies are able to be removed with v3 of list.
        public Task<StatusDto> RemoveMovie(int listId, int mediaId);
        public Task<StatusDto> AddMovie(int listId, int mediaId);
    }
}
