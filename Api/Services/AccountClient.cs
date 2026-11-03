using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Text.Json;

namespace Api.Services
{
    public sealed class AccountClient(HttpClient http, CurrentTmdbUser user) : IAccountClient
    {
        private readonly HttpClient _http = http;

        public async Task<StatusDto> AddToWatchlistAsync(AddMediaWatchlistDto request)
        {
            var response = await _http.PostAsJsonAsync(Endpoint("watchlist"), request);
            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            var tmdb = JsonSerializer.Deserialize<StatusDto>(body);

            return new StatusDto
            {
                Success = tmdb?.Success ?? false,
                StatusCode = tmdb?.StatusCode ?? (int)response.StatusCode,
                StatusMessage = tmdb?.StatusMessage ?? "Status Message not found."
            };
        }

        public async Task<MovieListResponseDto> GetWatchlistMoviesAsync(int page)
        {
            var response = await _http.GetAsync(Endpoint($"watchlist/movies?page={page}"));
            response.EnsureSuccessStatusCode();
            var listResult = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return listResult ?? new MovieListResponseDto();
        }

        public async Task<TvShowListResponseDto> GetWatchlistTVShowsAsync(int page)
        {
            var response = await _http.GetAsync(Endpoint($"watchlist/tv?page={page}"));
            response.EnsureSuccessStatusCode();
            var listResult = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return listResult ?? new TvShowListResponseDto();
        }

        public async Task<StatusDto> AddToFavoritesAsync(AddMediaFavoriteDto request)
        {
            var response = await _http.PostAsJsonAsync(Endpoint("favorite"), request);
            response.EnsureSuccessStatusCode();
            var body = await response.Content.ReadAsStringAsync();
            var tmdb = JsonSerializer.Deserialize<StatusDto>(body);

            return new StatusDto
            {
                Success = tmdb?.Success ?? false,
                StatusCode = tmdb?.StatusCode ?? (int)response.StatusCode,
                StatusMessage = tmdb?.StatusMessage ?? "Status Message not found."
            };
        }

        public async Task<MovieListResponseDto> GetFavoriteMoviesAsync(int page)
        {
            var response = await _http.GetAsync(Endpoint($"favorite/movies?page={page}"));
            response.EnsureSuccessStatusCode();
            var listResult = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return listResult ?? new MovieListResponseDto();
        }

        public async Task<TvShowListResponseDto> GetFavoriteTVShowsAsync(int page)
        {
            var response = await _http.GetAsync(Endpoint($"favorite/tv?page={page}"));
            response.EnsureSuccessStatusCode();
            var listResult = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return listResult ?? new TvShowListResponseDto();
        }

        public async Task<AccountListsResponseDto> GetListsAsync(int page)
        {
            var response = await _http.GetAsync(Endpoint($"lists?page={page}"));
            response.EnsureSuccessStatusCode();
            var listResult = await response.Content.ReadFromJsonAsync<AccountListsResponseDto>();
            return listResult ?? new AccountListsResponseDto();
        }

        private string Endpoint(string path) => $"{user.AccountId}/{path}{(path.Contains('?') ? "&" : "?")}{user.SessionQuery}";
    }
}
