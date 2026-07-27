using System.Text.Json.Serialization;

namespace Api.Controllers.Dto
{
    public sealed record StatusDto
    {
        public required bool Success { get; init; }
        [JsonPropertyName("status_code")]
        public required string StatusCode { get; init; }
        [JsonPropertyName("status_message")]
        public required string StatusMessage { get; init; }
    }
}
