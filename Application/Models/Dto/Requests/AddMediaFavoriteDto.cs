using System.Text.Json.Serialization;
using Application.Enums;

namespace Application.Models.Dto.Requests
{
    public class AddMediaFavoriteDto
    {
        [JsonPropertyName("media_type")]
        public MediaType Media { get; init; }

        [JsonPropertyName("media_id")]
        public int MediaId { get; init; }

        [JsonPropertyName("favorite")]
        public bool AddToList { get; init; }
    }
}
