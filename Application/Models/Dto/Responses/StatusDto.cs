using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record StatusDto
    {
        [JsonPropertyName("success")]
        public required bool Success { get; init; }

        [JsonPropertyName("status_code")]
        public required int StatusCode { get; init; }

        [JsonPropertyName("status_message")]
        public string? StatusMessage { get; init; }
    }
}
