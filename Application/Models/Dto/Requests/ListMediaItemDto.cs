using System.Text.Json.Serialization;

namespace Application.Models.Dto.Requests
{
    public sealed record ListMediaItemDto
    {
        [JsonPropertyName("media_id")]
        public int MediaId { get; init; }
    }
}
