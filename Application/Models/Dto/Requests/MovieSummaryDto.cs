namespace Application.Models.Dto.Requests
{
    public sealed record MovieSummaryDto
    {
        public int Id { get; init; }
        public required string Title { get; init; }
    }
}
