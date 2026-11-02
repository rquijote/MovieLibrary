const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, buildJsonRequest());

  if (!response.ok) {
    throw await requestError(response, path);
  }

  return (await response.json()) as T;
}

export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(
    `${apiBaseUrl}${path}`,
    buildJsonRequest({
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );

  if (!response.ok) {
    throw await requestError(response, path);
  }

  return (await response.json()) as TResponse;
}

export async function apiPut<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(
    `${apiBaseUrl}${path}`,
    buildJsonRequest({
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  );

  if (!response.ok) {
    throw await requestError(response, path);
  }

  return (await response.json()) as TResponse;
}

export async function apiDelete<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(
    `${apiBaseUrl}${path}`,
    buildJsonRequest({
      method: 'DELETE',
    }),
  );

  if (!response.ok) {
    throw await requestError(response, path);
  }

  return (await response.json()) as TResponse;
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
