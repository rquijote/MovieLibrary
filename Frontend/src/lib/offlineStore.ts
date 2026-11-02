export interface CachedContent {
  data: unknown;
  savedAt: number;
}

export interface PendingMutation {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  localListId?: number;
  state: 'pending' | 'sending' | 'blocked' | 'uncertain';
  error?: string;
}

export interface OfflineData {
  cache: Record<string, CachedContent>;
  queue: PendingMutation[];
  listIds: Record<string, number>;
  nextListId: number;
  revision: number;
  completed: Record<string, StatusDto>;
}

const databaseName = 'movie-library-offline-v1';
export const cacheLimit = 200;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('data');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Offline storage is blocked by another tab. Close it and retry.'));
  });
}

export async function readOfflineData(scope: string): Promise<OfflineData> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('data', 'readonly');
      const request = transaction.objectStore('data').get(scope);
      transaction.oncomplete = () => resolve({
        cache: {}, queue: [], listIds: {}, nextListId: -1, revision: 0, completed: {},
        ...request.result,
      });
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function writeOfflineData(scope: string, data: OfflineData): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('data', 'readwrite');
      transaction.objectStore('data').put(data, scope);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export function withOfflineLock<T>(scope: string, action: () => Promise<T>): Promise<T> {
  if (!navigator.locks) {
    return Promise.reject(new Error('Offline storage requires a browser with Web Locks support (HTTPS or localhost).'));
  }
  return navigator.locks.request(`movie-library:${scope}`, action);
}

export function cacheContent(data: OfflineData, path: string, content: unknown) {
  data.cache[path] = { data: content, savedAt: Date.now() };
  const entries = Object.entries(data.cache).sort((a, b) => b[1].savedAt - a[1].savedAt);
  data.cache = Object.fromEntries(entries.slice(0, cacheLimit));
}

export function resolveListPath(path: string, ids: Record<string, number>): string {
  return path.replace(/^(\/api\/Lists\/)(-\d+)(?=\/|$)/, (match, prefix, id) =>
    ids[id] === undefined ? match : `${prefix}${ids[id]}`);
}
import type { StatusDto } from '../types/media';
