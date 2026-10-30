import { apiBaseUrl } from '@/app/config/env';
import type { JWTResponse } from '@/app/types/auth';
import { ApiError } from './errors';
import { clearStoredTokens, readStoredTokens, storeTokens } from './tokenRefresh';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers);
  const hasJsonBody = options.body != null && !(options.body instanceof FormData);

  if (hasJsonBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const tokens = readStoredTokens();
    if (tokens?.jwt) headers.set('Authorization', `Bearer ${tokens.jwt}`);
  }

  return headers;
}

async function refreshTokens(): Promise<JWTResponse | null> {
  const tokens = readStoredTokens();
  if (!tokens) return null;

  const response = await fetch(`${apiBaseUrl}/api/v1/identity/Account/RefreshTokenData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokens)
  });

  if (!response.ok) {
    clearStoredTokens();
    return null;
  }

  const refreshed = (await response.json()) as JWTResponse;
  storeTokens(refreshed);
  return refreshed;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const requestOptions: RequestInit = {
    ...options,
    headers: buildHeaders(options),
    body:
      options.body == null || options.body instanceof FormData
        ? (options.body as BodyInit | undefined)
        : JSON.stringify(options.body)
  };

  const response = await fetch(`${apiBaseUrl}${path}`, requestOptions);

  if (response.status === 401 && options.auth !== false && options.retryOnUnauthorized !== false) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  const body = await parseResponse(response);
  if (!response.ok) {
    const message =
      typeof body === 'object' && body && 'error' in body
        ? String((body as { error: unknown }).error)
        : `Request failed with ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return body as T;
}
