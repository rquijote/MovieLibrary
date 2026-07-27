using System.Text.Json.Serialization;

namespace Api.Controllers.Dto
{
    public sealed record MovieDto
    {
        public int Id { get; init; }
        public required string Title { get; init; }
        
        [JsonPropertyName("release_date")]
        public required string ReleaseDate { get; init; }
    }
}
