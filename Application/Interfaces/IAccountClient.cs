using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;

namespace Application.Interfaces
{
    public interface IAccountClient
    {
        // Watchlist
        Task<StatusDto> AddToWatchlistAsync(AddMediaWatchlistDto request);
        Task<MovieListResponseDto> GetWatchlistMoviesAsync();
        Task<TvShowListResponseDto> GetWatchlistTVShowsAsync();

        // Favorites
        Task<StatusDto> AddToFavoritesAsync(AddMediaFavoriteDto request);
        Task<MovieListResponseDto> GetFavoriteMoviesAsync();
        Task<TvShowListResponseDto> GetFavoriteTVShowsAsync();
    }
}
