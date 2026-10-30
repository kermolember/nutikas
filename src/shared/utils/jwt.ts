import type { JwtClaims } from '@/app/types/auth';

const roleClaimUris = [
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'
];

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );
}

export function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null;
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtClaims;
  } catch {
    return null;
  }
}

export function jwtExpiresAt(claims: JwtClaims | null): Date | null {
  return claims?.exp ? new Date(claims.exp * 1000) : null;
}

export function jwtIsExpired(claims: JwtClaims | null, skewSeconds = 30): boolean {
  if (!claims?.exp) return false;
  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function getClaimRoles(claims: JwtClaims | null): string[] {
  if (!claims) return [];
  const rawValues = [claims.role, claims.roles, ...roleClaimUris.map((uri) => claims[uri])];

  return rawValues.flatMap((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    return String(value)
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);
  });
}

export function hasRole(claims: JwtClaims | null, role: string): boolean {
  return getClaimRoles(claims).some((item) => item.toLowerCase() === role.toLowerCase());
}
