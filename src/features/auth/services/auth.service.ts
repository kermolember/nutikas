import type { JWTResponse, LoginInfo, RegisterInfo } from '@/app/types/auth';
import { apiRequest } from '@/shared/api/http';

export function login(payload: LoginInfo) {
  return apiRequest<JWTResponse>('/api/v1/identity/Account/Login', {
    method: 'POST',
    body: payload,
    auth: false
  });
}

export function register(payload: RegisterInfo) {
  return apiRequest<JWTResponse>('/api/v1/identity/Account/Register', {
    method: 'POST',
    body: payload,
    auth: false
  });
}

export function refreshTokenData(payload: JWTResponse) {
  return apiRequest<JWTResponse>('/api/v1/identity/Account/RefreshTokenData', {
    method: 'POST',
    body: payload,
    auth: false
  });
}

export function logout(refreshToken: string) {
  return apiRequest<{ tokenDeleteCount: number }>('/api/v1/identity/Account/Logout', {
    method: 'POST',
    body: { refreshToken }
  });
}
