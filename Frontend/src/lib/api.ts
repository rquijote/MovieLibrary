import type { StatusDto } from '../types/media';
import { applyMutation, projectedContent, remapList } from './offlineProjection.ts';
import {
  cacheContent, readOfflineData, resolveListPath, withOfflineLock, writeOfflineData,
} from './offlineStore.ts';
import type { OfflineData, PendingMutation } from './offlineStore.ts';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const scope = apiBaseUrl || window.location.origin;
const queuedMessage = 'Saved on this device. Pending synchronization; not yet saved to the server.';
let status = {
  offline: !navigator.onLine, cached: false, pending: 0, syncing: false,
  error: null as string | null, needsConfirmation: false, synced: false,
};
const listeners = new Set<() => void>();

export function getOfflineStatus() { return status; }
export function subscribeOfflineStatus(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function updateStatus(change: Partial<typeof status>) {
  status = { ...status, ...change };
  for (const listener of listeners) listener();
}
export function reportOfflineError(error: unknown) {
  console.error('Offline support:', error);
  updateStatus({ error: error instanceof Error ? error.message : 'Offline storage is unavailable.' });
}

export async function apiGet<T>(path: string, cacheProjection?: (content: unknown) => unknown): Promise<T> {
  let data: OfflineData | undefined;
  try {
    data = await withOfflineLock(scope, () => readOfflineData(scope));
  } catch (error) {
    reportOfflineError(error);
  }
  const resolvedPath = resolveListPath(path, data?.listIds ?? {});
  const cached = data ? projectedContent(data, resolvedPath) : undefined;
  if (data?.queue.some((mutation) => mutation.method === 'DELETE'
    && /^\/api\/Lists\/-?\d+$/.test(mutation.path)
    && resolvedPath.startsWith(`${resolveListPath(mutation.path, data.listIds)}/`))) {
    throw new Error('This list has been deleted on this device. Deletion is pending synchronization.');
  }
  // Temporary lists exist only locally until their create operation is acknowledged.
  if (resolvedPath.match(/^\/api\/Lists\/-\d+/)) {
    if (cached !== undefined) return cached as T;
    throw new Error('This local list is not available on this device.');
  }

  let response: Response;
  try {
    if (!navigator.onLine) throw new TypeError('You are offline.');
    response = await fetch(`${apiBaseUrl}${resolvedPath}`, {
      ...buildJsonRequest(), signal: AbortSignal.timeout(8000), cache: 'no-store',
    });
  } catch (error) {
    if (!(error instanceof TypeError) && !(error instanceof DOMException && error.name === 'TimeoutError')) throw error;
    updateStatus({ offline: true });
    if (cached !== undefined) {
      updateStatus({ cached: true });
      return cached as T;
    }
    throw new Error('Connection unavailable. This content has not been saved on this device yet.', { cause: error });
  }
  // Never mask authorization failures, missing records, or invalid requests with stale content.
  if (!response.ok) {
    if (response.status >= 500 && cached !== undefined) {
      updateStatus({ offline: true, cached: true });
      return cached as T;
    }
    throw await requestError(response, path);
  }
  const content: unknown = await response.json();
  updateStatus({ offline: false });
  try {
    return await withOfflineLock(scope, async () => {
      const current = await readOfflineData(scope);
      if (current.revision !== data?.revision) {
        return cacheProjection ? content as T : (projectedContent(current, resolvedPath) ?? content) as T;
      }
      cacheContent(current, resolvedPath, cacheProjection ? cacheProjection(content) : content);
      await writeOfflineData(scope, current);
      return cacheProjection ? content as T : (projectedContent(current, resolvedPath) ?? content) as T;
    });
  } catch (error) {
    reportOfflineError(error);
    return content as T;
  }
}

export type MutationResult = (StatusDto & { queued: false }) | {
  queued: true;
  status_message: string;
  list_id?: number;
};

export function apiPost(path: string, body?: unknown): Promise<MutationResult> {
  return mutate('POST', path, body);
}
export function apiPut(path: string, body: unknown): Promise<MutationResult> {
  return mutate('PUT', path, body);
}
export function apiDelete(path: string): Promise<MutationResult> {
  return mutate('DELETE', path);
}

function safeToReplay(mutation: PendingMutation): boolean {
  return /^\/api\/Account\/(favorite|watchlist)$/.test(mutation.path)
    || /^\/api\/(Movie|TvShow)\/\d+\/rating$/.test(mutation.path)
    || /^\/api\/Lists\/-?\d+\/(add_movie|remove_movie|clear)$/.test(mutation.path)
    || mutation.method === 'PUT';
}

async function mutate(method: PendingMutation['method'], path: string, body?: unknown): Promise<MutationResult> {
  const [result] = await mutateMany([{ method, path, body }]);
  return result;
}

type MutationRequest = Pick<PendingMutation, 'method' | 'path' | 'body'>;

export async function apiUpdateList(
  listId: number,
  body: { name: string; description: string | null; language: string },
  previousIds: number[],
  selectedIds: number[],
): Promise<MutationResult[]> {
  const previous = new Set(previousIds);
  const selected = new Set(selectedIds);
  return mutateMany([
    { method: 'PUT', path: `/api/Lists/${listId}`, body },
    ...previousIds.filter((id) => !selected.has(id)).map((id): MutationRequest => ({
      method: 'POST', path: `/api/Lists/${listId}/remove_movie`, body: id,
    })),
    ...selectedIds.filter((id) => !previous.has(id)).map((id): MutationRequest => ({
      method: 'POST', path: `/api/Lists/${listId}/add_movie`, body: id,
    })),
  ]);
}

async function mutateMany(requests: MutationRequest[]): Promise<MutationResult[]> {
  const mutations = await withOfflineLock(scope, async () => {
    const data = await readOfflineData(scope);
    if (data.queue.length + requests.length > 100) {
      throw new Error('Cannot save these changes: the queue holds at most 100 edits. Synchronize before making more changes.');
    }
    const mutations = requests.map((request): PendingMutation => ({
      ...request, id: crypto.randomUUID(), state: 'pending',
      localListId: request.path === '/api/Lists' && request.method === 'POST' ? data.nextListId-- : undefined,
    }));
    data.queue.push(...mutations);
    await writeOfflineData(scope, data);
    updateStatus({ pending: data.queue.length, synced: false });
    return mutations;
  });
  const results = navigator.onLine ? await syncOfflineChanges() : new Map<string, StatusDto>();
  return withOfflineLock(scope, async () => {
    const data = await readOfflineData(scope);
    return mutations.map(({ id, localListId }): MutationResult => {
      const pending = data.queue.find((item) => item.id === id);
      if (pending?.state === 'blocked') throw new Error(pending.error);
      const list_id = localListId === undefined ? undefined : data.listIds[localListId] ?? localListId;
      if (pending) return { queued: true, status_message: queuedMessage, list_id };
      const confirmed = results.get(id) ?? data.completed[id];
      if (!confirmed) throw new Error('This pending edit was discarded in another tab. It was not confirmed by the server.');
      return {
        ...confirmed, queued: false, list_id: confirmed.list_id ?? list_id,
      };
    });
  });
}

export async function syncOfflineChanges(retry = false): Promise<Map<string, StatusDto>> {
  return withOfflineLock(scope, async () => {
    const data = await readOfflineData(scope);
    const results = new Map<string, StatusDto>();
    updateStatus({ pending: data.queue.length, syncing: navigator.onLine && data.queue.length > 0 });
    try {
      if (navigator.onLine && data.queue.length > 0 && status.offline) {
        try {
          const health = await fetch(`${apiBaseUrl}/health`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
          if (!health.ok || await health.json() !== 'Healthy') throw new Error('API health check failed.');
          updateStatus({ offline: false, error: null });
        } catch (error) {
          console.warn('API connection check failed:', error);
          updateStatus({ offline: true, error: 'API unavailable. Pending edits will retry when the connection returns.' });
          return results;
        }
      }
      while (navigator.onLine && data.queue.length > 0) {
        const mutation = data.queue[0];
        if ((mutation.state === 'sending' || mutation.state === 'uncertain') && safeToReplay(mutation)) {
          mutation.state = 'pending';
        }
        if (mutation.state !== 'pending' && !retry) {
          updateStatus({
            error: mutation.error ?? 'A previous request was interrupted. Verify the server before retrying.',
            needsConfirmation: true,
          });
          break;
        }
        retry = false;
        mutation.state = 'sending';
        await writeOfflineData(scope, data);
        const path = resolveListPath(mutation.path, data.listIds);
        if (/^\/api\/Lists\/-\d+/.test(path)) {
          throw new Error('Cannot synchronize this edit until its local list has been created.');
        }
        let response: Response;
        try {
          response = await fetch(`${apiBaseUrl}${path}`, {
            ...buildJsonRequest({
              method: mutation.method,
              ...(mutation.body === undefined ? {} : { body: JSON.stringify(mutation.body) }),
            }),
            signal: AbortSignal.timeout(10000),
          });
        } catch (error) {
          const safe = safeToReplay(mutation);
          mutation.state = safe ? 'pending' : 'uncertain';
          mutation.error = safe ? 'Connection unavailable. Pending edits will retry when the connection returns.'
            : 'Connection lost while sending an edit. It may already be saved on the server. Check before retrying.';
          await writeOfflineData(scope, data);
          updateStatus({ offline: true, error: mutation.error, needsConfirmation: !safe });
          console.warn(mutation.error, error);
          break;
        }
        let result: StatusDto | undefined;
        if (!response.ok) {
          mutation.state = response.status >= 500 && safeToReplay(mutation) ? 'pending' : 'blocked';
          mutation.error = (await requestError(response, path)).message;
        } else {
          try {
            result = await response.json();
          } catch (error) {
            mutation.state = 'uncertain';
            mutation.error = 'The edit response could not be read. Check the server before retrying.';
            console.error(mutation.error, error);
          }
        }
        if (result) {
          if (result.success !== true) {
            mutation.state = 'blocked';
            mutation.error = result.status_message ?? 'The server rejected this edit.';
          } else if (mutation.localListId !== undefined && (!Number.isInteger(result.list_id) || Number(result.list_id) < 1)) {
            mutation.state = 'uncertain';
            mutation.error = 'List creation returned no ID. Check the server before retrying.';
          } else {
            if (mutation.localListId !== undefined && result.list_id) {
              remapList(data, mutation.localListId, result.list_id);
            }
            applyMutation(data, mutation);
            data.queue.shift();
            data.revision += 1;
            data.completed[mutation.id] = result;
            data.completed = Object.fromEntries(Object.entries(data.completed).slice(-100));
            // If committing fails, leave the durable "sending" record intact. Never replay it automatically.
            await writeOfflineData(scope, data);
            results.set(mutation.id, result);
            updateStatus({
              pending: data.queue.length, offline: false, error: null,
              needsConfirmation: false, synced: true,
            });
            continue;
          }
        } else if (mutation.state === 'sending') {
          mutation.state = 'uncertain';
          mutation.error = 'The server returned an invalid edit response. Check the server before retrying.';
        }
        await writeOfflineData(scope, data);
        updateStatus({
          error: mutation.error, needsConfirmation: mutation.state !== 'pending',
          ...(response.status >= 500 ? { offline: true } : {}),
        });
        break;
      }
    } finally {
      updateStatus({ syncing: false, pending: data.queue.length });
    }
    return results;
  });
}

export async function discardPendingChanges() {
  await withOfflineLock(scope, async () => {
    const data = await readOfflineData(scope);
    data.queue = [];
    await writeOfflineData(scope, data);
    updateStatus({ pending: 0, error: null, needsConfirmation: false });
  });
}

export async function initializeOfflineSupport() {
  const online = () => {
    updateStatus({ offline: false });
    void syncOfflineChanges().catch(reportOfflineError);
  };
  window.addEventListener('online', online);
  window.addEventListener('offline', () => updateStatus({ offline: true }));
  // Retry unsent edits while this tab is open, including when only the API was disconnected.
  window.setInterval(() => {
    if (navigator.onLine) void syncOfflineChanges().catch(reportOfflineError);
  }, 30000);
  await syncOfflineChanges();
}

async function requestError(response: Response, path: string): Promise<Error> {
  const fallback = new Error(`Request failed (${response.status}) for ${path}`);

  if (!response.headers.get('Content-Type')?.includes('application/problem+json')) {
    return fallback;
  }

  try {
    const problem: unknown = await response.json();
    if (typeof problem === 'object' && problem !== null && 'title' in problem
      && typeof problem.title === 'string' && problem.title.trim()) {
      return new Error(`${problem.title} (${response.status})`);
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function buildJsonRequest(init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  };
}
