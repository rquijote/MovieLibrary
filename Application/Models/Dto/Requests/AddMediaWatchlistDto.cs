using System.Text.Json.Serialization;
using Application.Enums;

namespace Application.Models.Dto.Requests
{
    public sealed record AddMediaWatchlistDto
    {
        // JsonPropertyName will map to the exact JSON key the API expects.
        // Using the name "Media" is what the C# side expects. 
        [JsonPropertyName("media_type")]
        public MediaType Media { get; init; }

        [JsonPropertyName("media_id")]
        public int MediaId { get; init; }

        [JsonPropertyName("watchlist")]
        public bool AddToList { get; init; }
    }
}
