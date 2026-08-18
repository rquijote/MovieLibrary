using Application.Interfaces;
using Application.Models.Dto.Requests;
using Application.Models.Dto.Responses;
using System.Web;

namespace Api.Services
{
    public sealed class DiscoverMoviesClient(HttpClient http) : IDiscoverMoviesClient
    {
        private readonly HttpClient _http = http;

        public async Task<MovieListResponseDto> DiscoverMoviesAsync(DiscoverMoviesRequestDto request)
        {
            var queryString = BuildQueryString(request);
            var response = await _http.GetAsync($"discover/movie?{queryString}");
            var result = await response.Content.ReadFromJsonAsync<MovieListResponseDto>();
            return result ?? new MovieListResponseDto();
        }

        private static string BuildQueryString(DiscoverMoviesRequestDto request)
        {
            var parameters = new List<string>();

            parameters.Add($"page={request.Page}");

            if (!string.IsNullOrWhiteSpace(request.SortBy))
                parameters.Add($"sort_by={HttpUtility.UrlEncode(request.SortBy)}");

            if (!string.IsNullOrWhiteSpace(request.PrimaryReleaseDateGte))
                parameters.Add($"primary_release_date.gte={request.PrimaryReleaseDateGte}");

            if (!string.IsNullOrWhiteSpace(request.PrimaryReleaseDateLte))
                parameters.Add($"primary_release_date.lte={request.PrimaryReleaseDateLte}");

            if (!string.IsNullOrWhiteSpace(request.WithOriginalLanguage))
                parameters.Add($"with_original_language={request.WithOriginalLanguage}");

            if (!string.IsNullOrWhiteSpace(request.Region))
                parameters.Add($"region={request.Region}");

            if (!string.IsNullOrWhiteSpace(request.WithGenres))
                parameters.Add($"with_genres={request.WithGenres}");

            if (!string.IsNullOrWhiteSpace(request.WithCast))
                parameters.Add($"with_cast={request.WithCast}");

            if (!string.IsNullOrWhiteSpace(request.WithCrew))
                parameters.Add($"with_crew={request.WithCrew}");

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

            if (request.WithRuntimeGte.HasValue)
                parameters.Add($"with_runtime.gte={request.WithRuntimeGte.Value}");

            if (request.WithRuntimeLte.HasValue)
                parameters.Add($"with_runtime.lte={request.WithRuntimeLte.Value}");

            if (request.Year.HasValue)
                parameters.Add($"year={request.Year.Value}");

            if (request.PrimaryReleaseYear.HasValue)
                parameters.Add($"primary_release_year={request.PrimaryReleaseYear.Value}");

            if (request.IncludeAdult.HasValue)
                parameters.Add($"include_adult={request.IncludeAdult.Value.ToString().ToLower()}");

            if (request.IncludeVideo.HasValue)
                parameters.Add($"include_video={request.IncludeVideo.Value.ToString().ToLower()}");

            return string.Join("&", parameters);
        }
    }
}
