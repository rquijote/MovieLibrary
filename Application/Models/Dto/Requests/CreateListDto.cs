using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Application.Models.Dto.Requests
{
    public sealed record CreateListDto
    {
        [JsonPropertyName("name")]
        public required string Name { get; init; }
        [JsonPropertyName("description")]
        public string? Description { get; init; }
        [JsonPropertyName("language")]
        public required string Language { get; init; }

    }
}
