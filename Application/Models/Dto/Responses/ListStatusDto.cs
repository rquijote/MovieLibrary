using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record ListStatusDto
    {
        [JsonPropertyName("status_message")]
        public string? StatusMessage { get; init; }
        [JsonPropertyName("success")]
        public bool Success { get; init; }
        [JsonPropertyName("status_code")]
        public int StatusCode { get; init; }
        [JsonPropertyName("list_id")]
        public int ListId { get; init; }
    }
}
