using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record TvShowDto
    {
        [JsonPropertyName("adult")]
        public bool Adult { get; init; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; init; }

        [JsonPropertyName("genre_ids")]
        public List<int> GenreIds { get; init; } = [];

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("origin_country")]
        public List<string> OriginCountry { get; init; } = [];

        [JsonPropertyName("original_language")]
        public string OriginalLanguage { get; init; } = string.Empty;

        [JsonPropertyName("original_name")]
        public string OriginalName { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("popularity")]
        public double Popularity { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("first_air_date")]
        public string FirstAirDate { get; init; } = string.Empty;

        [JsonPropertyName("episode_run_time")]
        public List<int> EpisodeRunTime { get; init; } = [];

        [JsonPropertyName("genres")]
        public List<GenreDto> Genres { get; init; } = [];

        [JsonPropertyName("name")]
        public required string Name { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; init; }
    }
}
