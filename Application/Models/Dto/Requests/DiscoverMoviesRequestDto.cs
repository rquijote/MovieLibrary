using System.Text.Json.Serialization;

namespace Application.Models.Dto.Requests
{
    public sealed record DiscoverMoviesRequestDto
    {
        [JsonPropertyName("page")]
        public int Page { get; init; } = 1;

        [JsonPropertyName("sort_by")]
        public string? SortBy { get; init; }

        [JsonPropertyName("primary_release_date.gte")]
        public string? PrimaryReleaseDateGte { get; init; }

        [JsonPropertyName("primary_release_date.lte")]
        public string? PrimaryReleaseDateLte { get; init; }

        [JsonPropertyName("with_original_language")]
        public string? WithOriginalLanguage { get; init; } = "en";

        [JsonPropertyName("region")]
        public string? Region { get; init; }

        [JsonPropertyName("with_genres")]
        public string? WithGenres { get; init; }

        [JsonPropertyName("with_cast")]
        public string? WithCast { get; init; }

        [JsonPropertyName("with_crew")]
        public string? WithCrew { get; init; }

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

        [JsonPropertyName("with_runtime.gte")]
        public int? WithRuntimeGte { get; init; }

        [JsonPropertyName("with_runtime.lte")]
        public int? WithRuntimeLte { get; init; }

        [JsonPropertyName("year")]
        public int? Year { get; init; }

        [JsonPropertyName("primary_release_year")]
        public int? PrimaryReleaseYear { get; init; }

        [JsonPropertyName("include_adult")]
        public bool? IncludeAdult { get; init; }

        [JsonPropertyName("include_video")]
        public bool? IncludeVideo { get; init; }
    }
}
