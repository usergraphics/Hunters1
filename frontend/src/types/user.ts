// User Types - Aligned with Backend Schema

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'TENANT' | 'LANDLORD' | 'AGENT' | 'ADMIN';
  phone?: string;
  national_id?: string;
  subscription_tier: 'FREE' | 'STARTER' | 'VERIFIED' | 'MANAGER' | 'PRIORITY' | 'ESTATE';
  avatar_url?: string;
  is_phone_verified: boolean;
  is_id_verified: boolean;
  verification_status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser extends User {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
  role: 'tenant' | 'landlord';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ProfileUpdateData {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone_number?: string;
  avatar_url?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}
