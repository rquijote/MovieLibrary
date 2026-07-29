namespace Api.Controllers.Dto.MovieTV
{
    public sealed record TmdbSearchResponseDto
    {
        public List<MovieSummaryDto>? Movies { get; init; }
        public List<TVSummaryDto>? TVShows { get; init; }
    }
}
