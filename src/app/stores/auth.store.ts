import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { JWTResponse, LoginInfo, RegisterInfo } from '@/app/types/auth';
import { login, logout, register, refreshTokenData } from '@/features/auth/services/auth.service';
import { clearStoredTokens, readStoredTokens, storeTokens } from '@/shared/api/tokenRefresh';
import { decodeJwt, hasRole, jwtIsExpired } from '@/shared/utils/jwt';

export const useAuthStore = defineStore('auth', () => {
  const jwt = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const initialized = ref(false);

  const claims = computed(() => decodeJwt(jwt.value));
  const isAuthenticated = computed(() => Boolean(jwt.value && refreshToken.value));
  const isOrganiser = computed(() => hasRole(claims.value, 'organiser'));
  const displayName = computed(
    () =>
      claims.value?.name ??
      claims.value?.email ??
      claims.value?.given_name ??
      (isAuthenticated.value ? 'Signed in' : '')
  );

  function setTokens(tokens: JWTResponse) {
    jwt.value = tokens.jwt;
    refreshToken.value = tokens.refreshToken;
    storeTokens(tokens);
  }

  function clear() {
    jwt.value = null;
    refreshToken.value = null;
    clearStoredTokens();
  }

  function initialize() {
    if (initialized.value) return;
    const stored = readStoredTokens();
    if (stored) {
      jwt.value = stored.jwt;
      refreshToken.value = stored.refreshToken;
    }

    window.addEventListener('nutikas:tokens', (event) => {
      const tokens = (event as CustomEvent<JWTResponse>).detail;
      jwt.value = tokens.jwt;
      refreshToken.value = tokens.refreshToken;
    });
    window.addEventListener('nutikas:logout', () => {
      jwt.value = null;
      refreshToken.value = null;
    });
    initialized.value = true;
  }

  async function loginWithPassword(payload: LoginInfo) {
    setTokens(await login(payload));
  }

  async function registerAccount(payload: RegisterInfo) {
    setTokens(await register(payload));
  }

  async function refresh() {
    if (!jwt.value || !refreshToken.value) return false;
    try {
      setTokens(await refreshTokenData({ jwt: jwt.value, refreshToken: refreshToken.value }));
      return true;
    } catch {
      clear();
      return false;
    }
  }

  async function ensureFreshToken() {
    initialize();
    if (!isAuthenticated.value) return false;
    if (!jwtIsExpired(claims.value)) return true;
    return refresh();
  }

  async function logoutCurrentUser() {
    const token = refreshToken.value;
    if (token) {
      try {
        await logout(token);
      } catch {
        // Local logout has already completed.
      } finally {
        clear();
      }
      return;
    }

    clear();
  }

  return {
    jwt,
    refreshToken,
    claims,
    isAuthenticated,
    isOrganiser,
    displayName,
    initialize,
    loginWithPassword,
    registerAccount,
    refresh,
    ensureFreshToken,
    logoutCurrentUser,
    clear
  };
});
