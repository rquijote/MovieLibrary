using System.Text.Json.Serialization;

namespace Api.Controllers.Dto.MovieTV
{
    public sealed record MovieSummaryDto
    {
        public int Id { get; init; }
        public required string Title { get; init; }
    }
}
