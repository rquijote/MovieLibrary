const appendedDetails = [
  'aggregate_credits',
  'combined_credits',
  'content_ratings',
  'credits',
  'external_ids',
  'images',
  'keywords',
  'recommendations',
  'release_dates',
  'reviews',
  'similar',
  'translations',
  'videos',
];

export function projectTmdbDetailsForOfflineCache(path: string, content: unknown): unknown {
  const isMediaDetail = /^\/api\/(Movie|TvShow|Person)\/\d+$/.test(path);
  if (!isMediaDetail || typeof content !== 'object' || content === null || Array.isArray(content)) {
    return content;
  }

  const compact: Record<string, unknown> = Object.fromEntries(Object.entries(content));
  for (const key of appendedDetails) {
    delete compact[key];
  }

  return compact;
}

export function tmdbDetailsCacheProjection(path: string): (content: unknown) => unknown {
  return (content) => projectTmdbDetailsForOfflineCache(path, content);
}
