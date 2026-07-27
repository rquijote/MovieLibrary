using System.Text.Json.Serialization;

namespace Api.Controllers.Dto
{
    public sealed record MovieDto
    {
        [JsonPropertyName("adult")] public bool Adult { get; init; }
        [JsonPropertyName("backdrop_path")] public string? BackdropPath { get; init; }
        [JsonPropertyName("belongs_to_collection")] public BelongsToCollectionDto? BelongsToCollection { get; init; }
        [JsonPropertyName("budget")] public int Budget { get; init; }
        [JsonPropertyName("genres")] public List<GenreDto> Genres { get; init; } = [];
        [JsonPropertyName("homepage")] public string? Homepage { get; init; }
        [JsonPropertyName("id")] public int Id { get; init; }
        [JsonPropertyName("imdb_id")] public string? ImdbId { get; init; }
        [JsonPropertyName("origin_country")] public List<string> OriginCountry { get; init; } = [];
        [JsonPropertyName("original_language")] public string? OriginalLanguage { get; init; }
        [JsonPropertyName("original_title")] public string? OriginalTitle { get; init; }
        [JsonPropertyName("overview")] public string? Overview { get; init; }
        [JsonPropertyName("popularity")] public double Popularity { get; init; }
        [JsonPropertyName("poster_path")] public string? PosterPath { get; init; }
        [JsonPropertyName("production_companies")] public List<ProductionCompanyDto> ProductionCompanies { get; init; } = [];
        [JsonPropertyName("production_countries")] public List<ProductionCountryDto> ProductionCountries { get; init; } = [];
        [JsonPropertyName("release_date")] public string? ReleaseDate { get; init; } // or DateOnly with converter
        [JsonPropertyName("revenue")] public long Revenue { get; init; }
        [JsonPropertyName("runtime")] public int Runtime { get; init; }
        [JsonPropertyName("softcore")] public bool Softcore { get; init; }
        [JsonPropertyName("spoken_languages")] public List<SpokenLanguageDto> SpokenLanguages { get; init; } = [];
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("tagline")] public string? Tagline { get; init; }
        [JsonPropertyName("title")] public string? Title { get; init; }
        [JsonPropertyName("video")] public bool Video { get; init; }
        [JsonPropertyName("vote_average")] public double VoteAverage { get; init; }
        [JsonPropertyName("vote_count")] public int VoteCount { get; init; }
    }

    public sealed record BelongsToCollectionDto
    {
        [JsonPropertyName("id")] public int Id { get; init; }
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("poster_path")] public string? PosterPath { get; init; }
        [JsonPropertyName("backdrop_path")] public string? BackdropPath { get; init; }
    }

    public sealed record GenreDto
    {
        [JsonPropertyName("id")] public int Id { get; init; }
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

    public sealed record ProductionCompanyDto
    {
        [JsonPropertyName("id")] public int Id { get; init; }
        [JsonPropertyName("logo_path")] public string? LogoPath { get; init; }
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("origin_country")] public string? OriginCountry { get; init; }
    }

    public sealed record ProductionCountryDto
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

    public sealed record SpokenLanguageDto
    {
        [JsonPropertyName("english_name")] public string? EnglishName { get; init; }
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

}
