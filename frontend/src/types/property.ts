// Property Types - Aligned with Backend Schema

export interface PropertyLocation {
  address?: string;
  sub_location?: string;
  city?: string;
  region?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description?: string;
  property_type: 'apartment' | 'house' | 'studio' | 'villa' | 'room' | 'commercial';
  location: string;
  sub_location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  show_exact_location: boolean;
  primary_image?: string;
  images: string[];
  price: number;
  bedrooms: number;
  bathrooms: number;
  total_units: number;
  available_units?: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'PENDING';
  is_premium: boolean;
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  amenities?: string[];
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  location?: string;
  property_type?: string;
  price_min?: number;
  price_max?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
  is_premium?: boolean;
  search?: string;
}

export interface PropertySort {
  field: 'created_at' | 'price' | 'bedrooms' | 'title';
  order: 'asc' | 'desc';
}

export interface PropertyListResponse {
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PropertyCreateData {
  title: string;
  description?: string;
  property_type: string;
  location: string;
  sub_location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  show_exact_location?: boolean;
  primary_image?: string;
  images?: string[];
  price: number;
  bedrooms: number;
  bathrooms: number;
  total_units?: number;
  status?: string;
  is_premium?: boolean;
  is_featured?: boolean;
  amenities?: string[];
}

export interface PropertyUpdateData extends Partial<PropertyCreateData> {}
