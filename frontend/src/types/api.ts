// API Response Types

import type { Property } from './property';
import type { Booking } from './booking';
import type { User } from './user';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type PropertyListResponse = PaginatedResponse<Property>;

export type BookingListResponse = PaginatedResponse<Booking>;

export interface UserResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

export interface VerificationResponse {
  verified: boolean;
  message?: string;
}

export interface FavoriteResponse {
  isFavorite: boolean;
}
