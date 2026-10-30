export interface LoginInfo {
  email: string;
  password: string;
}

export interface RegisterInfo {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface JWTResponse {
  jwt: string;
  refreshToken: string;
}

export interface JwtClaims {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
  role?: string | string[];
  roles?: string | string[];
  [claim: string]: unknown;
}
