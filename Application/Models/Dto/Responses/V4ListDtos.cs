using System.Text.Json;
using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record V4ListDetailsDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; init; } = string.Empty;

        [JsonPropertyName("item_count")]
        public int ItemCount { get; init; }

        [JsonPropertyName("iso_639_1")]
        public string? Iso6391 { get; init; }

        [JsonPropertyName("public")]
        public bool Public { get; init; }

        [JsonPropertyName("results")]
        public List<JsonElement> Results { get; init; } = [];
    }

    public sealed record V4ListItemStatusDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("item_present")]
        public bool ItemPresent { get; init; }
    }
}
