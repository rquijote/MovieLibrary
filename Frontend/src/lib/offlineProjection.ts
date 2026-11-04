import type {
  AccountListsResponse, AccountStatesResponse, ListDetailsResponse, MediaItem,
  MediaListResponse,
} from '../types/media';
import type { CachedContent, OfflineData, PendingMutation } from './offlineStore.ts';
import { resolveListPath } from './offlineStore.ts';

function object(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function findMedia(cache: Record<string, CachedContent>, id: number, type: string): MediaItem | undefined {
  for (const entry of Object.values(cache)) {
    const data = object(entry.data);
    const candidates = [data, ...(Array.isArray(data.results) ? data.results : []),
      ...(Array.isArray(data.items) ? data.items : [])];
    const item = candidates.find((candidate) =>
      object(candidate).id === id && (type === 'movie' ? 'title' in object(candidate) : 'first_air_date' in object(candidate)));
    if (item) return item as MediaItem;
  }
}

// Project queued edits onto snapshots without overwriting the server's last known state.
export function applyMutation(data: OfflineData, mutation: PendingMutation) {
  const path = resolveListPath(mutation.path, data.listIds);
  const body = object(mutation.body);
  const listId = mutation.localListId === undefined ? undefined
    : data.listIds[mutation.localListId] ?? mutation.localListId;
  if (path === '/api/Lists' && mutation.method === 'POST' && listId !== undefined) {
    data.cache[`/api/Lists/${listId}/details`] ??= {
      savedAt: Date.now(),
      data: {
        id: listId, name: body.name, description: body.description ?? '',
        tags: body.tags ?? [], movie_order: body.movie_order ?? [], item_count: 0, items: [],
      },
    };
  }

  const listMatch = path.match(/^\/api\/Lists\/(-?\d+)(?:\/(add_movie|remove_movie|clear))?$/);
  const ratingMatch = path.match(/^\/api\/(Movie|TvShow)\/(\d+)\/rating$/);
  for (const [key, entry] of Object.entries(data.cache)) {
    if (key.startsWith('/api/Account/lists')) {
      const lists = entry.data as AccountListsResponse;
      if (listId !== undefined && !lists.results.some((list) => list.id === listId)) {
        if (lists.page === 1) {
          lists.results.unshift({
            id: listId, name: String(body.name), description: String(body.description ?? ''), item_count: 0,
            tags: Array.isArray(body.tags) ? body.tags : [],
          });
        }
        lists.total_results += 1;
        lists.total_pages = Math.max(1, lists.total_pages);
      }
      if (listMatch && mutation.method === 'DELETE') {
        lists.results = lists.results.filter((list) => list.id !== Number(listMatch[1]));
        lists.total_results = Math.max(0, lists.total_results - 1);
      }
      if (listMatch && mutation.method === 'PUT') {
        const list = lists.results.find((item) => item.id === Number(listMatch[1]));
        if (list) {
          Object.assign(list, { name: body.name, description: body.description ?? '' });
          if (Array.isArray(body.tags) && body.tags.every((tag): tag is string => typeof tag === 'string')) list.tags = body.tags;
        }
      }
    }

    if (listMatch && key === `/api/Lists/${listMatch[1]}/details`) {
      if (mutation.method === 'DELETE') {
        delete data.cache[key];
        continue;
      }
      const details = entry.data as ListDetailsResponse;
      if (mutation.method === 'PUT') {
        Object.assign(details, { name: body.name, description: body.description ?? '' });
        if (Array.isArray(body.tags) && body.tags.every((tag): tag is string => typeof tag === 'string')) details.tags = body.tags;
        if (Array.isArray(body.movie_order) && body.movie_order.every((id): id is number => typeof id === 'number')) details.movie_order = body.movie_order;
      } else if (listMatch[2] === 'clear') {
        details.items = [];
      } else if (listMatch[2] === 'remove_movie') {
        details.items = details.items.filter((item) => item.id !== mutation.body);
      } else if (listMatch[2] === 'add_movie' && !details.items.some((item) => item.id === mutation.body)) {
        const movie = findMedia(data.cache, Number(mutation.body), 'movie');
        if (movie && 'title' in movie) details.items.push(movie);
      }
      if (details.movie_order?.length) {
        const positions = new Map(details.movie_order.map((id, index) => [id, index]));
        details.items.sort((first, second) =>
          (positions.get(first.id) ?? Infinity) - (positions.get(second.id) ?? Infinity));
      }
      details.item_count = details.items.length;
      for (const cached of Object.values(data.cache)) {
        const summaries = object(cached.data).results;
        if (Array.isArray(summaries)) {
          for (const summary of summaries) {
            if (object(summary).id === details.id && 'item_count' in object(summary)) {
              summary.item_count = details.item_count;
            }
          }
        }
      }
    }

    if (listMatch && key.startsWith(`/api/Lists/${listMatch[1]}/item_status?`)) {
      const params = new URLSearchParams(key.split('?')[1]);
      if (Number(params.get('media_id')) === mutation.body) {
        entry.data = { ...object(entry.data), item_present: listMatch[2] === 'add_movie' };
      }
    }

    const mediaPrefix = body.media_type === 'movie' ? 'Movie' : 'TvShow';
    const isWatchlist = path === '/api/Account/watchlist';
    const isFavorite = path === '/api/Account/favorite';
    if ((isWatchlist || isFavorite) && key === `/api/${mediaPrefix}/${body.media_id}/account-states`) {
      const account = entry.data as AccountStatesResponse;
      if (isWatchlist) account.watchlist = Boolean(body.watchlist);
      else account.favorite = Boolean(body.favorite);
    }
    if (ratingMatch && key === `/api/${ratingMatch[1]}/${ratingMatch[2]}/account-states`) {
      (entry.data as AccountStatesResponse).rated = mutation.method === 'DELETE' ? null : { value: Number(body.value) };
    }
    const category = isWatchlist ? 'watchlist' : 'favourite';
    if ((isWatchlist || isFavorite) && key.split('?')[0] === `/api/Account/${category}/${body.media_type === 'movie' ? 'movies' : 'tv'}`) {
      const list = entry.data as MediaListResponse<MediaItem>;
      const enabled = isWatchlist ? body.watchlist : body.favorite;
      const existing = list.results.some((item) => item.id === body.media_id);
      if (!enabled && existing) {
        list.results = list.results.filter((item) => item.id !== body.media_id);
        list.total_results -= 1;
      } else if (enabled && !existing) {
        const item = findMedia(data.cache, Number(body.media_id), String(body.media_type));
        if (item) {
          if (list.page === 1) list.results.unshift(item);
          list.total_results += 1;
          list.total_pages = Math.max(1, list.total_pages);
        }
      }
    }
  }
}

export function projectedContent(data: OfflineData, path: string): unknown {
  const projected = structuredClone(data);
  for (const mutation of projected.queue) {
    if (mutation.state !== 'blocked') applyMutation(projected, mutation);
  }
  const resolvedPath = resolveListPath(path, projected.listIds);
  const match = resolvedPath.match(/^\/api\/Lists\/(-?\d+)\/item_status\?(.*)$/);
  if (match) {
    const details = projected.cache[`/api/Lists/${match[1]}/details`]?.data as ListDetailsResponse | undefined;
    const params = new URLSearchParams(match[2]);
    if (details) {
      return {
        id: details.id,
        item_present: params.get('media_type') === 'movie'
          && details.items.some((item) => item.id === Number(params.get('media_id'))),
      };
    }
  }
  return projected.cache[resolvedPath]?.data;
}

export function remapList(data: OfflineData, localId: number, serverId: number) {
  data.listIds[localId] = serverId;
  const oldKey = `/api/Lists/${localId}/details`;
  if (data.cache[oldKey]) {
    const entry = data.cache[oldKey];
    (entry.data as ListDetailsResponse).id = serverId;
    data.cache[`/api/Lists/${serverId}/details`] = entry;
    delete data.cache[oldKey];
  }
}
