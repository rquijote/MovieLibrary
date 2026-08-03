using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.Models.Dto.Requests
{
    public sealed record AddMediaDto
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

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MediaType
    {
        tv,
        movie
    }
}
