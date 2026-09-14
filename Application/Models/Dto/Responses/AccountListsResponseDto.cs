using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record AccountListsResponseDto
    {
        [JsonPropertyName("page")]
        public int Page { get; init; }

        [JsonPropertyName("results")]
        public List<AccountListSummaryDto> Results { get; init; } = [];

        [JsonPropertyName("total_pages")]
        public int TotalPages { get; init; }

        [JsonPropertyName("total_results")]
        public int TotalResults { get; init; }
    }

    public sealed record AccountListSummaryDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; init; } = string.Empty;

        [JsonPropertyName("item_count")]
        public int ItemCount { get; init; }
    }
}
