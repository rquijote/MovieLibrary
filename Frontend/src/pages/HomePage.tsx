import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { apiGet } from '../lib/api';
import { movieGenres, tvGenres } from '../lib/genres';
import {
  getImageUrl, getMediaDate, getMediaTitle, handleMediaImageError, prioritizeMediaWithPoster,
} from '../lib/media';
import type { MediaItem, MovieDto, MovieListResponse, TvShowDto, TvShowListResponse } from '../types/media';
import './HomePage.css';

interface HomeFeed<TItem> {
  items: TItem[];
  error: boolean;
}

interface FeaturedItem {
  item: MediaItem;
  mediaType: 'movie' | 'tv';
}

let cachedMovieFeed: HomeFeed<MovieDto> | null = null;
let cachedTvFeed: HomeFeed<TvShowDto> | null = null;
let movieFeedRequest: Promise<HomeFeed<MovieDto>> | null = null;
let tvFeedRequest: Promise<HomeFeed<TvShowDto>> | null = null;
const featureImageCache = new Map<string, HTMLImageElement>();

function getTrendingMovies(): Promise<HomeFeed<MovieDto>> {
  if (cachedMovieFeed) {
    return Promise.resolve(cachedMovieFeed);
  }
  if (movieFeedRequest) {
    return movieFeedRequest;
  }

  const request = apiGet<MovieListResponse>('/api/Trending/movies?timeWindow=week')
    .then(({ results }) => ({ items: prioritizeMediaWithPoster(results), error: false }), () => ({ items: [], error: true }))
    .then((feed) => {
      cachedMovieFeed = feed;
      return feed;
    })
    .finally(() => {
      if (movieFeedRequest === request) {
        movieFeedRequest = null;
      }
    });

  movieFeedRequest = request;
  return request;
}

function getTrendingTv(): Promise<HomeFeed<TvShowDto>> {
  if (cachedTvFeed) {
    return Promise.resolve(cachedTvFeed);
  }
  if (tvFeedRequest) {
    return tvFeedRequest;
  }

  const request = apiGet<TvShowListResponse>('/api/Trending/tv?timeWindow=week')
    .then(({ results }) => ({ items: prioritizeMediaWithPoster(results), error: false }), () => ({ items: [], error: true }))
    .then((feed) => {
      cachedTvFeed = feed;
      return feed;
    })
    .finally(() => {
      if (tvFeedRequest === request) {
        tvFeedRequest = null;
      }
    });

  tvFeedRequest = request;
  return request;
}

function preloadFeatureImage(imagePath: string | null | undefined) {
  if (!imagePath) {
    return;
  }

  const imageUrl = getImageUrl(imagePath, 'w1280');
  if (featureImageCache.has(imageUrl)) {
    return;
  }

  featureImageCache.set(imageUrl, new Image());
  featureImageCache.get(imageUrl)!.src = imageUrl;
  if (featureImageCache.size > 4) {
    const oldestImageUrl = featureImageCache.keys().next().value;
    if (oldestImageUrl) {
      featureImageCache.delete(oldestImageUrl);
    }
  }
}

function interleaveTrendingContent(movies: MovieDto[], tvShows: TvShowDto[]): FeaturedItem[] {
  const items: FeaturedItem[] = [];

  for (let index = 0; index < Math.max(movies.length, tvShows.length); index += 1) {
    if (movies[index]) {
      items.push({ item: movies[index], mediaType: 'movie' });
    }
    if (tvShows[index]) {
      items.push({ item: tvShows[index], mediaType: 'tv' });
    }
  }

  return [
    ...items.filter(({ item }) => Boolean(item.poster_path)),
    ...items.filter(({ item }) => !item.poster_path),
  ];
}

export function HomePage() {
  const [movies, setMovies] = useState<MovieDto[]>(() => cachedMovieFeed?.items ?? []);
  const [tvShows, setTvShows] = useState<TvShowDto[]>(() => cachedTvFeed?.items ?? []);
  const [isMoviesLoading, setIsMoviesLoading] = useState(() => cachedMovieFeed === null);
  const [isTvLoading, setIsTvLoading] = useState(() => cachedTvFeed === null);
  const [movieError, setMovieError] = useState(() => cachedMovieFeed?.error ?? false);
  const [tvError, setTvError] = useState(() => cachedTvFeed?.error ?? false);
  const [reloadCount, setReloadCount] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isFeatureVisible, setIsFeatureVisible] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    const loadTrending = async () => {
      setIsMoviesLoading(cachedMovieFeed === null);
      setIsTvLoading(cachedTvFeed === null);
      void getTrendingMovies().then((feed) => {
        if (!isCurrent) return;
        setMovies(feed.items);
        setMovieError(feed.error);
        setIsMoviesLoading(false);
      });
      void getTrendingTv().then((feed) => {
        if (!isCurrent) return;
        setTvShows(feed.items);
        setTvError(feed.error);
        setIsTvLoading(false);
      });
    };

    void loadTrending();
    return () => {
      isCurrent = false;
    };
  }, [reloadCount]);

  const featuredItems = interleaveTrendingContent(movies, tvShows);
  const featuredCount = featuredItems.length;
  const featuredPick = featuredCount > 0 ? featuredItems[featuredIndex % featuredCount] : undefined;
  const featuredMedia = featuredPick?.item;
  const featureImage = featuredMedia?.backdrop_path ?? featuredMedia?.poster_path;
  const featureDate = featuredMedia ? getMediaDate(featuredMedia) : '';
  const genreCatalog = featuredPick?.mediaType === 'tv' ? tvGenres : movieGenres;
  const featuredGenre = featuredMedia?.genre_ids
    .map((genreId) => genreCatalog.find((genre) => genre.id === genreId)?.name)
    .find((genreName) => genreName !== undefined);

  useEffect(() => {
    const items = interleaveTrendingContent(movies, tvShows);
    if (items.length < 2) {
      return;
    }

    const nextPick = items[(featuredIndex + 1) % items.length];
    preloadFeatureImage(nextPick.item.backdrop_path ?? nextPick.item.poster_path);
  }, [featuredIndex, movies, tvShows]);

  useEffect(() => {
    if (featuredCount < 2) {
      return;
    }

    let transitionTimeout: number | undefined;
    const rotationInterval = window.setInterval(() => {
      setIsFeatureVisible(false);
      transitionTimeout = window.setTimeout(() => {
        setFeaturedIndex((index) => (index + 1) % featuredCount);
        setIsFeatureVisible(true);
      }, 420);
    }, 8000);

    return () => {
      window.clearInterval(rotationInterval);
      if (transitionTimeout !== undefined) {
        window.clearTimeout(transitionTimeout);
      }
    };
  }, [featuredCount]);

  const retryLoading = (type: 'movies' | 'tv') => {
    if (type === 'movies') {
      cachedMovieFeed = null;
    } else {
      cachedTvFeed = null;
    }
    setReloadCount((count) => count + 1);
  };

  const isFeatureLoading = !featuredMedia && (isMoviesLoading || isTvLoading);

  return (
    <section className="home-page" aria-label="Movie and TV discovery">
      <header className="home-heading">
        <h1>Trending Movies &amp; TV</h1>
      </header>

      <section className="home-feature" aria-label="Featured trending media">
        {featureImage ? (
          <img
            className={`home-feature-image${isFeatureVisible ? '' : ' home-feature-faded'}`}
            src={getImageUrl(featureImage, 'w1280')}
            alt=""
            aria-hidden="true"
            onError={handleMediaImageError}
          />
        ) : null}
        {isFeatureLoading ? (
          <div className="home-feature-copy loading-placeholder" aria-hidden="true">
            <div className="loading-block home-loading-title" />
            <div className="loading-block loading-line" />
            <div className="loading-block loading-line" />
            <div className="loading-block loading-meta" />
          </div>
        ) : (
          <div className={`home-feature-copy${isFeatureVisible ? '' : ' home-feature-faded'}`}>
            <h2 id="home-feature-title">
              {featuredMedia ? getMediaTitle(featuredMedia) : 'No trending content available.'}
            </h2>
            <p className="home-feature-overview">{featuredMedia?.overview ?? ''}</p>
            <p className="home-feature-meta">
              {featureDate ? <span>{featureDate.slice(0, 4)}</span> : null}
              {featuredGenre ? <span>{featuredGenre}</span> : null}
              {featuredMedia && featuredMedia.vote_average > 0 ? <span>Rating {featuredMedia.vote_average.toFixed(1)}</span> : null}
            </p>
            <div className="home-feature-actions">
              <Link
                className="home-button home-button-primary"
                to={featuredPick ? `/${featuredPick.mediaType}/${featuredMedia?.id}` : '/movies?tab=trending'}
              >
                {featuredPick ? `View ${featuredPick.mediaType === 'movie' ? 'film' : 'show'}` : 'Browse trending'}
              </Link>
              <Link className="home-button home-button-secondary" to="/library/create-list">
                Make a list
              </Link>
            </div>
          </div>
        )}
      </section>

      <nav className="home-shortcuts" aria-label="Quick links">
        <span className="home-shortcuts-label">Jump to</span>
        <Link to="/movies?tab=trending">Trending movies</Link>
        <Link to="/tvshows/trending">Trending TV</Link>
        <Link to="/library?tab=watchlist">Your watchlist</Link>
      </nav>

      <div className="home-feeds">
        {isMoviesLoading ? (
          <LoadingState label="Loading this week's picks" />
        ) : movieError ? (
          <div className="home-feed-message" role="alert">
            <p>Trending movies could not load. Check that the API is running.</p>
            <button type="button" className="home-retry" onClick={() => retryLoading('movies')}>Try again</button>
          </div>
        ) : movies.length > 0 ? (
          <MediaRow title="Trending movies" items={movies} mediaType="movies" category="trending" preferImages fillRow />
        ) : (
          <p className="home-feed-message">No trending movies are available right now.</p>
        )}

        {isTvLoading ? (
          <LoadingState label="Loading TV shows" />
        ) : tvError ? (
          <div className="home-feed-message" role="alert">
            <p>Trending TV shows could not load.</p>
            <button type="button" className="home-retry" onClick={() => retryLoading('tv')}>Try again</button>
          </div>
        ) : tvShows.length > 0 ? (
          <MediaRow title="Trending TV" items={tvShows} mediaType="tv" category="trending" preferImages fillRow />
        ) : (
          <p className="home-feed-message">No trending TV shows are available right now.</p>
        )}
      </div>
    </section>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
