import type { JWTResponse } from '@/app/types/auth';

export const authStorageKeys = {
  jwt: 'nutikas.jwt',
  refreshToken: 'nutikas.refreshToken'
};

export function readStoredTokens(): JWTResponse | null {
  const jwt = localStorage.getItem(authStorageKeys.jwt);
  const refreshToken = localStorage.getItem(authStorageKeys.refreshToken);
  return jwt && refreshToken ? { jwt, refreshToken } : null;
}

export function storeTokens(tokens: JWTResponse): void {
  localStorage.setItem(authStorageKeys.jwt, tokens.jwt);
  localStorage.setItem(authStorageKeys.refreshToken, tokens.refreshToken);
  window.dispatchEvent(new CustomEvent('nutikas:tokens', { detail: tokens }));
}

export function clearStoredTokens(): void {
  localStorage.removeItem(authStorageKeys.jwt);
  localStorage.removeItem(authStorageKeys.refreshToken);
  window.dispatchEvent(new CustomEvent('nutikas:logout'));
}
