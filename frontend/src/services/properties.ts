// Properties Service - Real API Implementation with Map Features

import api from './api';
import type { Property, PropertyFilters, PropertyListResponse, PropertyCreateData, PropertyUpdateData } from '../types';

export interface PropertySearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: PropertyFilters;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const propertiesService = {
  async getProperties(params: PropertySearchParams = {}): Promise<PropertyListResponse> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', filters = {} } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', String(page));
    queryParams.append('limit', String(limit));
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    
    // Add filters
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.property_type) queryParams.append('property_type', filters.property_type);
    if (filters.price_min) queryParams.append('price_min', String(filters.price_min));
    if (filters.price_max) queryParams.append('price_max', String(filters.price_max));
    if (filters.bedrooms) queryParams.append('bedrooms', String(filters.bedrooms));
    if (filters.bathrooms) queryParams.append('bathrooms', String(filters.bathrooms));
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.is_premium !== undefined) queryParams.append('is_premium', String(filters.is_premium));
    if (filters.search) queryParams.append('search', filters.search);
    
    const response = await api.get<PropertyListResponse>(`/properties?${queryParams}`);
    return response.data;
  },

  async getPropertiesInBounds(bounds: MapBounds): Promise<Property[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('bounds', JSON.stringify(bounds));
    queryParams.append('limit', '100'); // Get more properties for map view
    
    const response = await api.get<PropertyListResponse>(`/properties?${queryParams}`);
    return response.data.data;
  },

  async getProperty(id: string): Promise<Property> {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  async createProperty(data: PropertyCreateData): Promise<Property> {
    const response = await api.post<Property>('/properties', data);
    return response.data;
  },

  async updateProperty(id: string, data: PropertyUpdateData): Promise<Property> {
    const response = await api.put<Property>(`/properties/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async getMyProperties(): Promise<Property[]> {
    const response = await api.get<Property[]>('/properties/my');
    return response.data;
  },

  async toggleFavorite(propertyId: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post<{ isFavorite: boolean }>(`/properties/${propertyId}/favorite`);
    return response.data;
  },

  async getFavorites(userId: string): Promise<Property[]> {
    const response = await api.get<Property[]>(`/properties/favorites/${userId}`);
    return response.data;
  },

  async approveProperty(id: string): Promise<Property> {
    const response = await api.patch<Property>(`/properties/${id}/approve`);
    return response.data;
  },

  async searchByLocation(query: string): Promise<Property[]> {
    const response = await api.get<PropertyListResponse>(`/properties?location=${encodeURIComponent(query)}&limit=20`);
    return response.data.data;
  }
};

export default propertiesService;
