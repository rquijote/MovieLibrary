export type MediaType = 'movies' | 'tv' | 'tvshows';

export type MediaCategory =
  | 'popular'
  | 'top-rated'
  | 'trending'
  | 'watchlist'
  | 'favorite'
  | 'now-playing'
  | 'upcoming'
  | 'airing-today'
  | 'on-the-air';

export interface MovieDto {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  original_language: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  video: boolean;
  genre_ids: number[];
  genres?: GenreDto[];
  runtime?: number;
  adult?: boolean;
  budget?: number;
  revenue?: number;
  status?: string | null;
  tagline?: string | null;
  homepage?: string | null;
  imdb_id?: string | null;
  production_companies?: ProductionCompanyDto[];
  production_countries?: ProductionCountryDto[];
  spoken_languages?: SpokenLanguageDto[];
  credits?: CreditsDto | null;
  videos?: VideoListDto | null;
  images?: ImageListDto | null;
  recommendations?: MediaListResponse<MovieDto> | null;
  similar?: MediaListResponse<MovieDto> | null;
  reviews?: ReviewsDto | null;
  release_dates?: ReleaseDatesDto | null;
  keywords?: { keywords: KeywordDto[] } | null;
  external_ids?: ExternalIdsDto | null;
  translations?: TranslationsDto | null;
  belongs_to_collection?: MovieCollectionDto | null;
}

export interface TvShowDto {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  original_language: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country: string[];
  genre_ids: number[];
  genres?: GenreDto[];
  adult?: boolean;
  homepage?: string | null;
  last_air_date?: string | null;
  number_of_episodes?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
  next_episode_to_air?: EpisodeToAirDto | null;
  last_episode_to_air?: EpisodeToAirDto | null;
  status?: string | null;
  tagline?: string | null;
  type?: string | null;
  networks?: ProductionCompanyDto[];
  created_by?: PersonSummaryDto[];
  production_companies?: ProductionCompanyDto[];
  production_countries?: ProductionCountryDto[];
  seasons?: SeasonSummaryDto[];
  spoken_languages?: SpokenLanguageDto[];
  aggregate_credits?: CreditsDto | null;
  videos?: VideoListDto | null;
  images?: ImageListDto | null;
  recommendations?: MediaListResponse<TvShowDto> | null;
  similar?: MediaListResponse<TvShowDto> | null;
  reviews?: ReviewsDto | null;
  content_ratings?: ContentRatingsDto | null;
  keywords?: { results: KeywordDto[] } | null;
  external_ids?: ExternalIdsDto | null;
  translations?: TranslationsDto | null;
}

export interface GenreDto {
  id: number;
  name: string;
}

export interface ProductionCompanyDto {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface ProductionCountryDto {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguageDto {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface SeasonSummaryDto {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
}

export interface EpisodeToAirDto {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  runtime: number | null;
  still_path: string | null;
}

export interface PersonSummaryDto {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface CreditsDto {
  cast: CastCreditDto[];
  crew: CrewCreditDto[];
}

export interface CastCreditDto {
  id: number;
  name: string;
  profile_path: string | null;
  character: string | null;
  order: number;
  roles: { character: string | null; episode_count: number }[];
  total_episode_count: number | null;
}

export interface CrewCreditDto {
  id: number;
  name: string;
  profile_path: string | null;
  department: string | null;
  job: string | null;
  jobs: { job: string | null; episode_count: number }[];
  total_episode_count: number | null;
}

export interface VideoListDto {
  results: VideoDto[];
}

export interface VideoDto {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string | null;
}

export interface ImageListDto {
  backdrops: MediaImageDto[];
  posters: MediaImageDto[];
  logos: MediaImageDto[];
  profiles?: MediaImageDto[];
  stills?: MediaImageDto[];
}

export interface MediaImageDto {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
}

export interface ReviewsDto {
  results: ReviewDto[];
}

export interface ReviewDto {
  id: string;
  author: string;
  author_details: { name: string | null; username: string | null; rating: number | null };
  content: string;
  created_at: string | null;
  url: string | null;
}

export interface ReleaseDatesDto {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string | null; release_date: string | null; type: number; note: string | null }[];
  }[];
}

export interface ContentRatingsDto {
  results: { iso_3166_1: string; rating: string; rating_descriptors: string[] }[];
}

export interface KeywordDto {
  id: number;
  name: string;
}

export interface ExternalIdsDto {
  imdb_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  wikidata_id: string | null;
}

export interface TranslationsDto {
  translations: {
    iso_3166_1: string;
    iso_639_1: string;
    name: string | null;
    english_name: string | null;
    data: { title: string | null; name: string | null; overview: string | null; tagline: string | null };
  }[];
}

export interface MovieCollectionDto {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: MovieDto[];
}

export interface PersonSearchResultDto {
  id: number;
  name: string;
  known_for_department: string | null;
  profile_path: string | null;
}

export interface PersonSearchResponseDto {
  page: number;
  results: PersonSearchResultDto[];
  total_pages: number;
  total_results: number;
}

export interface KeywordSearchResponseDto {
  page: number;
  results: KeywordDto[];
  total_pages: number;
  total_results: number;
}

export interface PersonCreditDto {
  id: number;
  media_type: 'movie' | 'tv';
  title: string | null;
  name: string | null;
  poster_path: string | null;
  release_date: string | null;
  first_air_date: string | null;
  character: string | null;
  job: string | null;
  department: string | null;
  episode_count: number | null;
  vote_average: number;
}

export interface PersonDetailsDto {
  id: number;
  name: string;
  also_known_as: string[];
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  known_for_department: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  homepage: string | null;
  imdb_id: string | null;
  external_ids: ExternalIdsDto | null;
  images: ImageListDto | null;
  combined_credits: { cast: PersonCreditDto[]; crew: PersonCreditDto[] } | null;
}

export interface TvSeasonDetailsDto extends SeasonSummaryDto {
  episodes: TvEpisodeDto[];
  credits: CreditsDto | null;
  images: ImageListDto | null;
}

export interface TvEpisodeDto {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  episode_type: string | null;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  guest_stars: CastCreditDto[];
  crew: CrewCreditDto[];
  credits: CreditsDto | null;
  videos: VideoListDto | null;
  images: ImageListDto | null;
}

export interface StatusDto {
  success: boolean;
  status_code: number;
  status_message?: string;
  list_id?: number;
}

export interface AccountListSummary {
  id: number;
  name: string;
  description: string;
  item_count: number;
}

export interface AccountListsResponse {
  page: number;
  results: AccountListSummary[];
  total_pages: number;
  total_results: number;
}

export interface ListDetailsResponse {
  id: number;
  name: string;
  description: string;
  item_count: number;
  items: MovieDto[];
}

export interface MediaListResponse<TItem> {
  page: number;
  results: TItem[];
  total_pages: number;
  total_results: number;
}

export interface AccountStatesRated {
    value: number;
}

export interface AccountStatesResponse {
    id: number;
    favorite: boolean;
    rated: AccountStatesRated | null;
    watchlist: boolean;
}

export type MovieListResponse = MediaListResponse<MovieDto>;
export type TvShowListResponse = MediaListResponse<TvShowDto>;
export type MediaItem = MovieDto | TvShowDto;
