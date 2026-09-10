using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record MovieDto
    {
        [JsonPropertyName("adult")]
        public bool Adult { get; init; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; init; }

        [JsonPropertyName("genre_ids")]
        public List<int> GenreIds { get; init; } = [];

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("title")]
        public required string Title { get; init; }

        [JsonPropertyName("original_language")]
        public string OriginalLanguage { get; init; } = string.Empty;

        [JsonPropertyName("original_title")]
        public string OriginalTitle { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("popularity")]
        public double Popularity { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("release_date")]
        public string ReleaseDate { get; init; } = string.Empty;

        [JsonPropertyName("runtime")]
        public int? Runtime { get; init; }

        [JsonPropertyName("genres")]
        public List<GenreDto> Genres { get; init; } = [];

        [JsonPropertyName("softcore")]
        public bool Softcore { get; init; }

        [JsonPropertyName("video")]
        public bool Video { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; init; }
    }
}
