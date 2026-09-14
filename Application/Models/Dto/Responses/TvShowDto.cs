using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record TvShowDto
    {
        [JsonPropertyName("adult")]
        public bool Adult { get; init; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; init; }

        [JsonPropertyName("genres")]
        public List<GenreDto> Genres { get; init; } = [];

        [JsonPropertyName("genre_ids")]
        public List<int> GenreIds { get; init; } = [];

        [JsonPropertyName("episode_run_time")]
        public List<int> EpisodeRunTime { get; init; } = [];

        [JsonPropertyName("first_air_date")]
        public string FirstAirDate { get; init; } = string.Empty;

        [JsonPropertyName("homepage")]
        public string? Homepage { get; init; }

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("last_air_date")]
        public string? LastAirDate { get; init; }

        [JsonPropertyName("name")]
        public required string Name { get; init; }

        [JsonPropertyName("networks")]
        public List<NetworkDto> Networks { get; init; } = [];

        [JsonPropertyName("next_episode_to_air")]
        public EpisodeToAirDto? NextEpisodeToAir { get; init; }

        [JsonPropertyName("number_of_episodes")]
        public int NumberOfEpisodes { get; init; }

        [JsonPropertyName("number_of_seasons")]
        public int NumberOfSeasons { get; init; }

        [JsonPropertyName("origin_country")]
        public List<string> OriginCountry { get; init; } = [];

        [JsonPropertyName("original_language")]
        public string OriginalLanguage { get; init; } = string.Empty;

        [JsonPropertyName("original_name")]
        public string OriginalName { get; init; } = string.Empty;

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

        [JsonPropertyName("seasons")]
        public List<SeasonDto> Seasons { get; init; } = [];

        [JsonPropertyName("softcore")]
        public bool Softcore { get; init; }

        [JsonPropertyName("spoken_languages")]
        public List<SpokenLanguageDto> SpokenLanguages { get; init; } = [];

        [JsonPropertyName("status")]
        public string? Status { get; init; }

        [JsonPropertyName("tagline")]
        public string? Tagline { get; init; }

        [JsonPropertyName("type")]
        public string? Type { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; init; }
    }

    public sealed record EpisodeToAirDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; init; }

        [JsonPropertyName("air_date")]
        public string? AirDate { get; init; }

        [JsonPropertyName("episode_number")]
        public int EpisodeNumber { get; init; }

        [JsonPropertyName("episode_type")]
        public string? EpisodeType { get; init; }

        [JsonPropertyName("production_code")]
        public string? ProductionCode { get; init; }

        [JsonPropertyName("runtime")]
        public int? Runtime { get; init; }

        [JsonPropertyName("season_number")]
        public int SeasonNumber { get; init; }

        [JsonPropertyName("show_id")]
        public int ShowId { get; init; }

        [JsonPropertyName("still_path")]
        public string? StillPath { get; init; }
    }

    public sealed record NetworkDto
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

    public sealed record SeasonDto
    {
        [JsonPropertyName("air_date")]
        public string? AirDate { get; init; }

        [JsonPropertyName("episode_count")]
        public int EpisodeCount { get; init; }

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("season_number")]
        public int SeasonNumber { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }
    }
}
