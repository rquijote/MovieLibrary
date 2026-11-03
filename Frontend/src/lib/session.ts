import { useSyncExternalStore } from 'react';

export interface TmdbAccount {
  id: number;
  username: string;
  name: string;
  avatarPath?: string | null;
}

interface Session {
  authenticated: boolean;
  account?: TmdbAccount;
  csrfToken: string;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
let session: Session = { authenticated: false, csrfToken: '' };
const listeners = new Set<() => void>();
let channel: BroadcastChannel | undefined;

function publish(next: Session) {
  session = next;
  for (const listener of listeners) listener();
}

export function getAccountId(): number | null {
  return session.authenticated ? session.account?.id ?? null : null;
}

export function assertAccount(accountId: number | null) {
  if (accountId !== getAccountId()) throw new Error('The signed-in account changed. Reload before continuing.');
}

export function sessionHeaders(accountId: number | null = getAccountId()): Record<string, string> {
  assertAccount(accountId);
  return {
    ...(session.csrfToken ? { 'X-CSRF-TOKEN': session.csrfToken } : {}),
    ...(accountId === null ? {} : { 'X-TMDB-Account-Id': String(accountId) }),
  };
}

export function useSession() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => session,
    () => session,
  );
}

export async function initializeSession(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/Auth/session`, {
    credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Could not verify your TMDB login. Please reconnect and try again.');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('authenticated' in data)
    || typeof data.authenticated !== 'boolean' || !('csrfToken' in data) || typeof data.csrfToken !== 'string') {
    throw new Error('The login service returned an invalid session.');
  }
  if (data.authenticated) {
    if (!('account' in data) || !data.account || typeof data.account !== 'object'
      || !('id' in data.account) || typeof data.account.id !== 'number' || !Number.isInteger(data.account.id)
      || data.account.id < 1 || !('username' in data.account) || typeof data.account.username !== 'string') {
      throw new Error('The login service returned an invalid TMDB account.');
    }
    publish({
      authenticated: true, csrfToken: data.csrfToken,
      account: { id: data.account.id, username: data.account.username,
        name: 'name' in data.account && typeof data.account.name === 'string' ? data.account.name : '' },
    });
  } else {
    publish({ authenticated: false, csrfToken: data.csrfToken });
  }
}

export function expireSession() {
  publish({ authenticated: false, csrfToken: '' });
}

async function authPost(path: string): Promise<Response> {
  const response = await fetch(`${apiBaseUrl}/api/Auth/${path}`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: sessionHeaders(), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok && !(path === 'logout' && response.status === 502)) {
    throw new Error(`TMDB ${path} failed (${response.status}). Please try again.`);
  }
  return response;
}

export interface TmdbApproval {
  approvalUrl: string;
  /** `manual` means TMDB cannot redirect back (e.g. localhost), so call `completeTmdbLogin` after approval. */
  completion: 'manual' | 'redirect';
}

export async function startTmdbLogin(): Promise<TmdbApproval> {
  await initializeSession();
  const response = await authPost('login');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('approvalUrl' in data) || typeof data.approvalUrl !== 'string') {
    throw new Error('TMDB did not provide an approval link.');
  }
  const url = new URL(data.approvalUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'www.themoviedb.org' || !url.pathname.startsWith('/authenticate/')) {
    throw new Error('The login service returned an invalid TMDB approval link.');
  }
  // Keep approval in its own tab and finish through the browser-bound correlation cookie.
  url.searchParams.delete('redirect_to');
  return { approvalUrl: url.href, completion: 'manual' };
}

/** Returns false while TMDB approval is still pending. */
export async function completeTmdbLogin(): Promise<boolean> {
  const response = await fetch(`${apiBaseUrl}/api/Auth/complete`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: sessionHeaders(), signal: AbortSignal.timeout(15000),
  });
  if (response.status === 409) return false;
  if (response.status === 400) throw new Error('This TMDB login expired. Please start again.');
  if (!response.ok) throw new Error(`TMDB login failed (${response.status}). Please try again.`);
  return true;
}

export async function logoutFromTmdb() {
  const response = await authPost('logout');
  expireSession();
  channel?.postMessage('changed');
  return response.ok;
}

export function watchSessionChanges() {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      expireSession();
      window.location.reload();
    }
  });
  if (!('BroadcastChannel' in window)) return;
  channel = new BroadcastChannel('movie-library-auth');
  channel.onmessage = () => {
    expireSession();
    window.location.reload();
  };
}

export function announceSession() {
  channel?.postMessage('changed');
}
