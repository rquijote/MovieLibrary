using Api.Options;
using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using Microsoft.Extensions.Options;

namespace Api.Services
{
    public sealed class AccountClient(HttpClient http, IOptions<TmdbOptions> options) : IAccountClient
    {
        private readonly TmdbOptions _tmdb = options.Value;

        public Task<StatusDto> AddToWatchlistAsync(AddMediaWatchlistDto request)
        {
            throw new NotImplementedException();
        }

        public Task<MovieListResponseDto> GetWatchlistMoviesAsync()
        {
            throw new NotImplementedException();
        }

        public Task<TvShowListResponseDto> GetWatchlistTVShowsAsync()
        {
            throw new NotImplementedException();
        }

        public Task<StatusDto> AddToFavoritesAsync(AddMediaFavoriteDto request)
        {
            throw new NotImplementedException();
        }

        public Task<MovieListResponseDto> GetFavoriteMoviesAsync()
        {
            throw new NotImplementedException();
        }

        public Task<TvShowListResponseDto> GetFavoriteTVShowsAsync()
        {
            throw new NotImplementedException();
        }
    }
}
