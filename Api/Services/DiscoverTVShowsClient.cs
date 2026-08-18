using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Web;

namespace Api.Services
{
    public sealed class DiscoverTVShowsClient(HttpClient http) : IDiscoverTVShowsClient
    {
        private readonly HttpClient _http = http;

        public async Task<TvShowListResponseDto> DiscoverTVShowsAsync(DiscoverTVShowsRequestDto request)
        {
            var queryString = BuildQueryString(request);
            var response = await _http.GetAsync($"discover/tv?{queryString}");
            var result = await response.Content.ReadFromJsonAsync<TvShowListResponseDto>();
            return result ?? new TvShowListResponseDto();
        }

        private static string BuildQueryString(DiscoverTVShowsRequestDto request)
        {
            var parameters = new List<string>();

            parameters.Add($"page={request.Page}");

            if (!string.IsNullOrWhiteSpace(request.SortBy))
                parameters.Add($"sort_by={HttpUtility.UrlEncode(request.SortBy)}");

            if (!string.IsNullOrWhiteSpace(request.FirstAirDateGte))
                parameters.Add($"first_air_date.gte={request.FirstAirDateGte}");

            if (!string.IsNullOrWhiteSpace(request.FirstAirDateLte))
                parameters.Add($"first_air_date.lte={request.FirstAirDateLte}");

            if (!string.IsNullOrWhiteSpace(request.WithOriginalLanguage))
                parameters.Add($"with_original_language={request.WithOriginalLanguage}");

            if (!string.IsNullOrWhiteSpace(request.WithGenres))
                parameters.Add($"with_genres={request.WithGenres}");

            if (!string.IsNullOrWhiteSpace(request.WithNetworks))
                parameters.Add($"with_networks={request.WithNetworks}");

            if (!string.IsNullOrWhiteSpace(request.WithCompanies))
                parameters.Add($"with_companies={request.WithCompanies}");

            if (!string.IsNullOrWhiteSpace(request.WithKeywords))
                parameters.Add($"with_keywords={request.WithKeywords}");

            if (request.VoteAverageGte.HasValue)
                parameters.Add($"vote_average.gte={request.VoteAverageGte.Value}");

            if (request.VoteAverageLte.HasValue)
                parameters.Add($"vote_average.lte={request.VoteAverageLte.Value}");

            if (request.VoteCountGte.HasValue)
                parameters.Add($"vote_count.gte={request.VoteCountGte.Value}");

            if (request.FirstAirDateYear.HasValue)
                parameters.Add($"first_air_date_year={request.FirstAirDateYear.Value}");

            if (!string.IsNullOrWhiteSpace(request.Timezone))
                parameters.Add($"timezone={HttpUtility.UrlEncode(request.Timezone)}");

            if (request.WithRuntimeGte.HasValue)
                parameters.Add($"with_runtime.gte={request.WithRuntimeGte.Value}");

            if (request.WithRuntimeLte.HasValue)
                parameters.Add($"with_runtime.lte={request.WithRuntimeLte.Value}");

            if (request.IncludeAdult.HasValue)
                parameters.Add($"include_adult={request.IncludeAdult.Value.ToString().ToLower()}");

            if (request.ScreenedTheatrically.HasValue)
                parameters.Add($"screened_theatrically={request.ScreenedTheatrically.Value.ToString().ToLower()}");

            return string.Join("&", parameters);
        }
    }
}
