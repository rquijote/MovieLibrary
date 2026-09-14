export type MediaType = 'movies' | 'tv';

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
  episode_run_time?: number[];
}

export interface GenreDto {
  id: number;
  name: string;
}

export interface StatusDto {
  success: boolean;
  status_code: number;
  status_message?: string;
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

export interface MediaListResponse<TItem> {
  page: number;
  results: TItem[];
  total_pages: number;
  total_results: number;
}

export type MovieListResponse = MediaListResponse<MovieDto>;
export type TvShowListResponse = MediaListResponse<TvShowDto>;
export type MediaItem = MovieDto | TvShowDto;
