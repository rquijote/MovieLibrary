using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public record AccountStatesRatedDto
    {
        [JsonPropertyName("value")]
        public double Value { get; init; }
    }

    public sealed record AccountStatesDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("favorite")]
        public bool Favorite { get; init; }

        [JsonPropertyName("rated")]
        public AccountStatesRatedDto? Rated { get; init; }

        [JsonPropertyName("watchlist")]
        public bool Watchlist { get; init; }
    }
}
