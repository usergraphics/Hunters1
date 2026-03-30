// Auth Service

import api from './api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', credentials);
    const { accessToken, user } = response.data;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    // Convert backend user format to frontend user format
    const frontendUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatar: user.avatar_url || undefined,
      role: user.role.toLowerCase() as 'tenant' | 'landlord' | 'admin',
      phone: user.phone_number || undefined,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    };
    return { user: frontendUser, token: accessToken };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', data);
    const { accessToken, user } = response.data;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    // Convert backend user format to frontend user format
    const frontendUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatar: user.avatar_url || undefined,
      role: user.role.toLowerCase() as 'tenant' | 'landlord' | 'admin',
      phone: user.phone_number || undefined,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    };
    return { user: frontendUser, token: accessToken };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<any>('/auth/me');
    const user = response.data;
    // Convert backend user format to frontend user format
    const frontendUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatar: user.avatar_url || undefined,
      role: user.role.toLowerCase() as 'tenant' | 'landlord' | 'admin',
      phone: user.phone_number || undefined,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    };
    return frontendUser;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    // Convert frontend user format to backend format for update
    const backendData: any = {
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      phone_number: data.phone
    };
    
    // Remove empty strings
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === '') {
        delete backendData[key];
      }
    });
    
    const response = await api.patch<any>('/auth/profile', backendData);
    const user = response.data;
    // Convert backend user format to frontend user format
    const frontendUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatar: user.avatar_url || undefined,
      role: user.role.toLowerCase() as 'tenant' | 'landlord' | 'admin',
      phone: user.phone_number || undefined,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    };
    return frontendUser;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export default authService;
