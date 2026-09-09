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
