using System.Text.Json.Serialization;

namespace Application.Models.Dto.Requests
{
    public sealed record AddMediaRatingDto
    {
        [JsonPropertyName("value")]
        public double Value { get; init; }
    }
}
