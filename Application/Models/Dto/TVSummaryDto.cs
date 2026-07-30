namespace Application.Models.Dto
{
    public sealed record TVSummaryDto
    {
        public int Id { get; init; }
        public required string Name { get; init; }
    }
}
