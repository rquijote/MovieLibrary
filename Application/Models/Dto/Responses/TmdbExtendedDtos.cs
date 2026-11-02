using System.Text.Json.Serialization;

namespace Application.Models.Dto.Responses
{
    public sealed record CreditsDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("cast")]
        public List<CastCreditDto> Cast { get; init; } = [];

        [JsonPropertyName("crew")]
        public List<CrewCreditDto> Crew { get; init; } = [];
    }

    public sealed record MovieCollectionDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; init; }

        [JsonPropertyName("parts")]
        public List<MovieDto> Parts { get; init; } = [];
    }

    public sealed record CastCreditDto
    {
        [JsonPropertyName("adult")]
        public bool Adult { get; init; }

        [JsonPropertyName("gender")]
        public int Gender { get; init; }

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("known_for_department")]
        public string? KnownForDepartment { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("original_name")]
        public string? OriginalName { get; init; }

        [JsonPropertyName("popularity")]
        public double Popularity { get; init; }

        [JsonPropertyName("profile_path")]
        public string? ProfilePath { get; init; }

        [JsonPropertyName("cast_id")]
        public int? CastId { get; init; }

        [JsonPropertyName("character")]
        public string? Character { get; init; }

        [JsonPropertyName("credit_id")]
        public string? CreditId { get; init; }

        [JsonPropertyName("order")]
        public int Order { get; init; }

        [JsonPropertyName("roles")]
        public List<AggregateRoleDto> Roles { get; init; } = [];

        [JsonPropertyName("total_episode_count")]
        public int? TotalEpisodeCount { get; init; }
    }

    public sealed record CrewCreditDto
    {
        [JsonPropertyName("adult")]
        public bool Adult { get; init; }

        [JsonPropertyName("gender")]
        public int Gender { get; init; }

        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("known_for_department")]
        public string? KnownForDepartment { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("original_name")]
        public string? OriginalName { get; init; }

        [JsonPropertyName("popularity")]
        public double Popularity { get; init; }

        [JsonPropertyName("profile_path")]
        public string? ProfilePath { get; init; }

        [JsonPropertyName("credit_id")]
        public string? CreditId { get; init; }

        [JsonPropertyName("department")]
        public string? Department { get; init; }

        [JsonPropertyName("job")]
        public string? Job { get; init; }

        [JsonPropertyName("jobs")]
        public List<AggregateJobDto> Jobs { get; init; } = [];

        [JsonPropertyName("total_episode_count")]
        public int? TotalEpisodeCount { get; init; }
    }

    public sealed record AggregateRoleDto
    {
        [JsonPropertyName("credit_id")]
        public string? CreditId { get; init; }

        [JsonPropertyName("character")]
        public string? Character { get; init; }

        [JsonPropertyName("episode_count")]
        public int EpisodeCount { get; init; }
    }

    public sealed record AggregateJobDto
    {
        [JsonPropertyName("credit_id")]
        public string? CreditId { get; init; }

        [JsonPropertyName("job")]
        public string? Job { get; init; }

        [JsonPropertyName("episode_count")]
        public int EpisodeCount { get; init; }
    }

    public sealed record VideoListDto
    {
        [JsonPropertyName("results")]
        public List<VideoDto> Results { get; init; } = [];
    }

    public sealed record VideoDto
    {
        [JsonPropertyName("id")]
        public string Id { get; init; } = string.Empty;

        [JsonPropertyName("key")]
        public string Key { get; init; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("site")]
        public string Site { get; init; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; init; } = string.Empty;

        [JsonPropertyName("official")]
        public bool Official { get; init; }

        [JsonPropertyName("published_at")]
        public string? PublishedAt { get; init; }

        [JsonPropertyName("size")]
        public int Size { get; init; }
    }

    public sealed record ImageListDto
    {
        [JsonPropertyName("backdrops")]
        public List<MediaImageDto> Backdrops { get; init; } = [];

        [JsonPropertyName("posters")]
        public List<MediaImageDto> Posters { get; init; } = [];

        [JsonPropertyName("logos")]
        public List<MediaImageDto> Logos { get; init; } = [];

        [JsonPropertyName("stills")]
        public List<MediaImageDto> Stills { get; init; } = [];
    }

    public sealed record MediaImageDto
    {
        [JsonPropertyName("aspect_ratio")]
        public double AspectRatio { get; init; }

        [JsonPropertyName("file_path")]
        public string FilePath { get; init; } = string.Empty;

        [JsonPropertyName("height")]
        public int Height { get; init; }

        [JsonPropertyName("width")]
        public int Width { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }
    }

    public sealed record MediaRecommendationsDto<TMedia>
    {
        [JsonPropertyName("results")]
        public List<TMedia> Results { get; init; } = [];
    }

    public sealed record ReviewsDto
    {
        [JsonPropertyName("results")]
        public List<ReviewDto> Results { get; init; } = [];
    }

    public sealed record ReviewDto
    {
        [JsonPropertyName("id")]
        public string Id { get; init; } = string.Empty;

        [JsonPropertyName("author")]
        public string Author { get; init; } = string.Empty;

        [JsonPropertyName("author_details")]
        public ReviewAuthorDetailsDto AuthorDetails { get; init; } = new();

        [JsonPropertyName("content")]
        public string Content { get; init; } = string.Empty;

        [JsonPropertyName("created_at")]
        public string? CreatedAt { get; init; }

        [JsonPropertyName("url")]
        public string? Url { get; init; }
    }

    public sealed record ReviewAuthorDetailsDto
    {
        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("username")]
        public string? Username { get; init; }

        [JsonPropertyName("rating")]
        public double? Rating { get; init; }
    }

    public sealed record ReleaseDatesDto
    {
        [JsonPropertyName("results")]
        public List<ReleaseCountryDto> Results { get; init; } = [];
    }

    public sealed record ReleaseCountryDto
    {
        [JsonPropertyName("iso_3166_1")]
        public string CountryCode { get; init; } = string.Empty;

        [JsonPropertyName("release_dates")]
        public List<ReleaseDateDto> ReleaseDates { get; init; } = [];
    }

    public sealed record ReleaseDateDto
    {
        [JsonPropertyName("certification")]
        public string? Certification { get; init; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; init; }

        [JsonPropertyName("type")]
        public int Type { get; init; }

        [JsonPropertyName("note")]
        public string? Note { get; init; }
    }

    public sealed record ContentRatingsDto
    {
        [JsonPropertyName("results")]
        public List<ContentRatingDto> Results { get; init; } = [];
    }

    public sealed record ContentRatingDto
    {
        [JsonPropertyName("iso_3166_1")]
        public string CountryCode { get; init; } = string.Empty;

        [JsonPropertyName("rating")]
        public string Rating { get; init; } = string.Empty;

        [JsonPropertyName("rating_descriptors")]
        public List<string> RatingDescriptors { get; init; } = [];
    }

    public sealed record MovieKeywordsDto
    {
        [JsonPropertyName("keywords")]
        public List<KeywordDto> Keywords { get; init; } = [];
    }

    public sealed record TvKeywordsDto
    {
        [JsonPropertyName("results")]
        public List<KeywordDto> Results { get; init; } = [];
    }

    public sealed record KeywordDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;
    }

    public sealed record ExternalIdsDto
    {
        [JsonPropertyName("imdb_id")]
        public string? ImdbId { get; init; }

        [JsonPropertyName("facebook_id")]
        public string? FacebookId { get; init; }

        [JsonPropertyName("instagram_id")]
        public string? InstagramId { get; init; }

        [JsonPropertyName("twitter_id")]
        public string? TwitterId { get; init; }

        [JsonPropertyName("wikidata_id")]
        public string? WikidataId { get; init; }
    }

    public sealed record TranslationsDto
    {
        [JsonPropertyName("translations")]
        public List<TranslationDto> Translations { get; init; } = [];
    }

    public sealed record TranslationDto
    {
        [JsonPropertyName("iso_3166_1")]
        public string CountryCode { get; init; } = string.Empty;

        [JsonPropertyName("iso_639_1")]
        public string LanguageCode { get; init; } = string.Empty;

        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("english_name")]
        public string? EnglishName { get; init; }

        [JsonPropertyName("data")]
        public TranslationDataDto Data { get; init; } = new();
    }

    public sealed record TranslationDataDto
    {
        [JsonPropertyName("title")]
        public string? Title { get; init; }

        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("overview")]
        public string? Overview { get; init; }

        [JsonPropertyName("tagline")]
        public string? Tagline { get; init; }
    }

    public sealed record PersonSearchResponseDto
    {
        [JsonPropertyName("page")]
        public int Page { get; init; }

        [JsonPropertyName("results")]
        public List<PersonSearchResultDto> Results { get; init; } = [];

        [JsonPropertyName("total_pages")]
        public int TotalPages { get; init; }

        [JsonPropertyName("total_results")]
        public int TotalResults { get; init; }
    }

    public sealed record PersonSearchResultDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("known_for_department")]
        public string? KnownForDepartment { get; init; }

        [JsonPropertyName("profile_path")]
        public string? ProfilePath { get; init; }

        [JsonPropertyName("known_for")]
        public List<PersonCreditDto> KnownFor { get; init; } = [];
    }

    public sealed record PersonDetailsDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("also_known_as")]
        public List<string> AlsoKnownAs { get; init; } = [];

        [JsonPropertyName("biography")]
        public string? Biography { get; init; }

        [JsonPropertyName("birthday")]
        public string? Birthday { get; init; }

        [JsonPropertyName("deathday")]
        public string? Deathday { get; init; }

        [JsonPropertyName("gender")]
        public int Gender { get; init; }

        [JsonPropertyName("known_for_department")]
        public string? KnownForDepartment { get; init; }

        [JsonPropertyName("place_of_birth")]
        public string? PlaceOfBirth { get; init; }

        [JsonPropertyName("profile_path")]
        public string? ProfilePath { get; init; }

        [JsonPropertyName("homepage")]
        public string? Homepage { get; init; }

        [JsonPropertyName("imdb_id")]
        public string? ImdbId { get; init; }

        [JsonPropertyName("combined_credits")]
        public PersonCombinedCreditsDto? CombinedCredits { get; init; }

        [JsonPropertyName("images")]
        public PersonImagesDto? Images { get; init; }

        [JsonPropertyName("external_ids")]
        public ExternalIdsDto? ExternalIds { get; init; }
    }

    public sealed record PersonCombinedCreditsDto
    {
        [JsonPropertyName("cast")]
        public List<PersonCreditDto> Cast { get; init; } = [];

        [JsonPropertyName("crew")]
        public List<PersonCreditDto> Crew { get; init; } = [];
    }

    public sealed record PersonCreditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("media_type")]
        public string MediaType { get; init; } = string.Empty;

        [JsonPropertyName("title")]
        public string? Title { get; init; }

        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("original_title")]
        public string? OriginalTitle { get; init; }

        [JsonPropertyName("original_name")]
        public string? OriginalName { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; init; }

        [JsonPropertyName("first_air_date")]
        public string? FirstAirDate { get; init; }

        [JsonPropertyName("character")]
        public string? Character { get; init; }

        [JsonPropertyName("job")]
        public string? Job { get; init; }

        [JsonPropertyName("department")]
        public string? Department { get; init; }

        [JsonPropertyName("episode_count")]
        public int? EpisodeCount { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }
    }

    public sealed record PersonImagesDto
    {
        [JsonPropertyName("profiles")]
        public List<MediaImageDto> Profiles { get; init; } = [];
    }

    public sealed record TvSeasonDetailsDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("air_date")]
        public string? AirDate { get; init; }

        [JsonPropertyName("season_number")]
        public int SeasonNumber { get; init; }

        [JsonPropertyName("episode_count")]
        public int EpisodeCount { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("episodes")]
        public List<TvEpisodeDto> Episodes { get; init; } = [];

        [JsonPropertyName("credits")]
        public CreditsDto? Credits { get; init; }

        [JsonPropertyName("images")]
        public ImageListDto? Images { get; init; }
    }

    public sealed record TvEpisodeDto
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("overview")]
        public string Overview { get; init; } = string.Empty;

        [JsonPropertyName("air_date")]
        public string? AirDate { get; init; }

        [JsonPropertyName("episode_number")]
        public int EpisodeNumber { get; init; }

        [JsonPropertyName("season_number")]
        public int SeasonNumber { get; init; }

        [JsonPropertyName("episode_type")]
        public string? EpisodeType { get; init; }

        [JsonPropertyName("production_code")]
        public string? ProductionCode { get; init; }

        [JsonPropertyName("runtime")]
        public int? Runtime { get; init; }

        [JsonPropertyName("still_path")]
        public string? StillPath { get; init; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; init; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; init; }

        [JsonPropertyName("guest_stars")]
        public List<CastCreditDto> GuestStars { get; init; } = [];

        [JsonPropertyName("crew")]
        public List<CrewCreditDto> Crew { get; init; } = [];

        [JsonPropertyName("credits")]
        public CreditsDto? Credits { get; init; }

        [JsonPropertyName("videos")]
        public VideoListDto? Videos { get; init; }

        [JsonPropertyName("images")]
        public ImageListDto? Images { get; init; }
    }

    public sealed record KeywordSearchResponseDto
    {
        [JsonPropertyName("page")]
        public int Page { get; init; }

        [JsonPropertyName("results")]
        public List<KeywordDto> Results { get; init; } = [];

        [JsonPropertyName("total_pages")]
        public int TotalPages { get; init; }

        [JsonPropertyName("total_results")]
        public int TotalResults { get; init; }
    }
}
