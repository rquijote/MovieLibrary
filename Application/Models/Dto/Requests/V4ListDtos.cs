using Application.Enums;
using System.Text.Json.Serialization;

namespace Application.Models.Dto.Requests
{
    public sealed record V4ListItemDto
    {
        [JsonPropertyName("media_type")]
        public MediaType MediaType { get; init; }

        [JsonPropertyName("media_id")]
        public int MediaId { get; init; }

        [JsonPropertyName("comment")]
        public string? Comment { get; init; }
    }

    public sealed record V4ListItemsRequestDto
    {
        [JsonPropertyName("items")]
        public List<V4ListItemDto> Items { get; init; } = [];
    }

    public sealed record UpdateListDto
    {
        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("description")]
        public string? Description { get; init; }

        [JsonPropertyName("iso_639_1")]
        public string? Iso6391 { get; init; }

        [JsonPropertyName("public")]
        public bool? Public { get; init; }

        [JsonPropertyName("sort_by")]
        public string? SortBy { get; init; }
    }
}
