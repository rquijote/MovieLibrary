using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IAccountClient
    {
        // Watchlist
        Task<StatusDto> AddToWatchlistAsync(AddMediaWatchlistDto request);
        Task<MovieListResponseDto> GetWatchlistMoviesAsync(int page);
        Task<TvShowListResponseDto> GetWatchlistTVShowsAsync(int page);

        // Favorites
        Task<StatusDto> AddToFavoritesAsync(AddMediaFavoriteDto request);
        Task<MovieListResponseDto> GetFavoriteMoviesAsync(int page);
        Task<TvShowListResponseDto> GetFavoriteTVShowsAsync(int page);

        // Account Lists
        Task<AccountListsResponseDto> GetListsAsync(int page);
    }
}
