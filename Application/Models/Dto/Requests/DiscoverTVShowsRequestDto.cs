using System.Text.Json.Serialization;

namespace Application.Models.Dto.Requests
{
    public sealed record DiscoverTVShowsRequestDto
    {
        [JsonPropertyName("page")]
        public int Page { get; init; } = 1;

        [JsonPropertyName("sort_by")]
        public string? SortBy { get; init; }

        [JsonPropertyName("first_air_date.gte")]
        public string? FirstAirDateGte { get; init; }

        [JsonPropertyName("first_air_date.lte")]
        public string? FirstAirDateLte { get; init; }

        [JsonPropertyName("with_original_language")]
        public string? WithOriginalLanguage { get; init; } = "en";

        [JsonPropertyName("with_genres")]
        public string? WithGenres { get; init; }

        [JsonPropertyName("with_networks")]
        public string? WithNetworks { get; init; }

        [JsonPropertyName("with_companies")]
        public string? WithCompanies { get; init; }

        [JsonPropertyName("with_keywords")]
        public string? WithKeywords { get; init; }

        [JsonPropertyName("vote_average.gte")]
        public decimal? VoteAverageGte { get; init; }

        [JsonPropertyName("vote_average.lte")]
        public decimal? VoteAverageLte { get; init; }

        [JsonPropertyName("vote_count.gte")]
        public int? VoteCountGte { get; init; }

        [JsonPropertyName("first_air_date_year")]
        public int? FirstAirDateYear { get; init; }

        [JsonPropertyName("timezone")]
        public string? Timezone { get; init; }

        [JsonPropertyName("with_runtime.gte")]
        public int? WithRuntimeGte { get; init; }

        [JsonPropertyName("with_runtime.lte")]
        public int? WithRuntimeLte { get; init; }

        [JsonPropertyName("include_adult")]
        public bool? IncludeAdult { get; init; }

        [JsonPropertyName("screened_theatrically")]
        public bool? ScreenedTheatrically { get; init; }
    }
}
