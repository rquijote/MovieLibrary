using System.Text.Json;
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
        public JsonElement? Rated { get; init; } // Rated can be false, null or AccountStatesRatedDto.

        [JsonPropertyName("watchlist")]
        public bool Watchlist { get; init; }

        [JsonIgnore]
        public bool RatedIsFalse => Rated is { ValueKind: JsonValueKind.False }; // Flags false e.g. if statements

        [JsonIgnore]
        public bool RatedIsNull => Rated is null || Rated.Value.ValueKind == JsonValueKind.Null; // Flags null

        [JsonIgnore]
        public double? RatedValue => // Flags AccountStatesRatedDto
            Rated is { ValueKind: JsonValueKind.Object } &&
            Rated.Value.TryGetProperty("value", out var valueEl) &&
            valueEl.TryGetDouble(out var value)
                ? value
                : null;
    }
}