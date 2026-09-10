using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record GenreDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;
    }
}
