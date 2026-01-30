import { Role } from './business.models';

export { Role };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  contactInfo?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
