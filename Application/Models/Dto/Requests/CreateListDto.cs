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

        /// <summary>Gets the list tags, or null to preserve existing tags on update.</summary>
        [JsonPropertyName("tags")]
        public List<string>? Tags { get; init; }

        /// <summary>Gets the preferred movie order, or null to preserve it on update.</summary>
        [JsonPropertyName("movie_order")]
        public List<int>? MovieOrder { get; init; }
    }
}
