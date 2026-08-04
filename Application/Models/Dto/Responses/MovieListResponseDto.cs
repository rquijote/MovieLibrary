using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record MovieListResponseDto
    {
        [JsonPropertyName("page")]
        public int Page { get; init; }

        [JsonPropertyName("results")]
        public List<MovieDto> Results { get; init; } = [];

        [JsonPropertyName("total_pages")]
        public int TotalPages { get; init; }

        [JsonPropertyName("total_results")]
        public int TotalResults { get; init; }
    }
}
