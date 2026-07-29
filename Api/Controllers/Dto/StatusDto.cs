using System.Text.Json.Serialization;

namespace Api.Controllers.Dto
{
    public sealed record StatusDto
    {
        public required bool Success { get; init; }
        [JsonPropertyName("status_code")]
        public required int StatusCode { get; init; }
        [JsonPropertyName("status_message")]
        public string? StatusMessage { get; init; }
    }
}
