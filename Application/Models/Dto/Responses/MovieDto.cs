using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record MovieDto
    {
        [JsonPropertyName("adult")]
        public bool Adult { get; init; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; init; }

        [JsonPropertyName("belongs_to_collection")]
        public object? BelongsToCollection { get; init; }

        [JsonPropertyName("budget")]
        public long Budget { get; init; }

        [JsonPropertyName("genres")]
        public List<GenreDto> Genres { get; init; } = [];

        [JsonPropertyName("genre_ids")]
        public List<int> GenreIds { get; init; } = [];

        [JsonPropertyName("homepage")]
        public string? Homepage { get; init; }

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("imdb_id")]
        public string? ImdbId { get; init; }

        [JsonPropertyName("origin_country")]
        public List<string> OriginCountry { get; init; } = [];

        [JsonPropertyName("title")]
        public required string Title { get; init; }

        [JsonPropertyName("original_language")]
        public string OriginalLanguage { get; init; } = string.Empty;

        [JsonPropertyName("original_title")]
        public string OriginalTitle { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("popularity")]
        public double Popularity { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("production_companies")]
        public List<ProductionCompanyDto> ProductionCompanies { get; init; } = [];

        [JsonPropertyName("production_countries")]
        public List<ProductionCountryDto> ProductionCountries { get; init; } = [];

        [JsonPropertyName("release_date")]
        public string ReleaseDate { get; init; } = string.Empty;

        [JsonPropertyName("revenue")]
        public long Revenue { get; init; }

        [JsonPropertyName("runtime")]
        public int? Runtime { get; init; }

        [JsonPropertyName("softcore")]
        public bool Softcore { get; init; }

        [JsonPropertyName("spoken_languages")]
        public List<SpokenLanguageDto> SpokenLanguages { get; init; } = [];

        [JsonPropertyName("status")]
        public string? Status { get; init; }

        [JsonPropertyName("tagline")]
        public string? Tagline { get; init; }

        [JsonPropertyName("video")]
        public bool Video { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; init; }
    }

    public sealed record GenreDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;
    }

    public sealed record ProductionCompanyDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("logo_path")]
        public string? LogoPath { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("origin_country")]
        public string? OriginCountry { get; init; }
    }

    public sealed record ProductionCountryDto
    {
        [JsonPropertyName("iso_3166_1")]
        public string Iso31661 { get; init; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;
    }

    public sealed record SpokenLanguageDto
    {
        [JsonPropertyName("english_name")]
        public string EnglishName { get; init; } = string.Empty;

        [JsonPropertyName("iso_639_1")]
        public string Iso6391 { get; init; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;
    }
}
