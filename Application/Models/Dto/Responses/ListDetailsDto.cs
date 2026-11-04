using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record ListDetailsDto
    {
        [JsonPropertyName("created_by")]
        public string CreatedBy { get; init; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; init; } = string.Empty;

        [JsonPropertyName("favorite_count")]
        public int FavoriteCount { get; init; }

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("items")]
        public List<MovieDto> Items { get; init; } = [];

        [JsonPropertyName("item_count")]
        public int ItemCount { get; init; }

        [JsonPropertyName("name")]
        public required string Name { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        /// <summary>Gets the tags assigned to the list.</summary>
        [JsonPropertyName("tags")]
        public List<string> Tags { get; init; } = [];

        /// <summary>Gets the preferred movie ordering, including queued additions.</summary>
        [JsonPropertyName("movie_order")]
        public List<int> MovieOrder { get; init; } = [];
    }
}
