// Booking Types - Aligned with Backend Schema

export interface Booking {
  id: string;
  property_id: string;
  unit_id?: string;
  tenant_id: string;
  landlord_id?: string;
  viewing_date: string;
  viewing_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  is_priority: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  property?: {
    id: string;
    title: string;
    location: string;
    primary_image?: string;
  };
  tenant?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  landlord?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface BookingCreateData {
  property_id: string;
  unit_id?: string;
  viewing_date: string;
  viewing_time: string;
  notes?: string;
  is_priority?: boolean;
}

export interface BookingUpdateData {
  viewing_date?: string;
  viewing_time?: string;
  status?: Booking['status'];
  notes?: string;
  is_priority?: boolean;
}

export interface BookingListResponse {
  data: Booking[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BookingFilters {
  property_id?: string;
  tenant_id?: string;
  landlord_id?: string;
  status?: Booking['status'];
  viewing_date?: string;
  is_priority?: boolean;
}
