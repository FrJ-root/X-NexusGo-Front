export enum Role {
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  CLIENT = 'CLIENT'
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email?: string | null;
  password?: string | null;
}

export interface RegisterRequest {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  contactInfo?: string | null;
  role?: Role | string | null;
}
