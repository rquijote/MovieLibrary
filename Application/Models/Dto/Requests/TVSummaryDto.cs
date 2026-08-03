namespace Application.Models.Dto.Requests
{
    public sealed record TVSummaryDto
    {
        public int Id { get; init; }
        public required string Name { get; init; }
    }
}
