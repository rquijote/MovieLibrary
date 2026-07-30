namespace Application.Models.Dto
{
    public sealed record MovieSummaryDto
    {
        public int Id { get; init; }
        public required string Title { get; init; }
    }
}
