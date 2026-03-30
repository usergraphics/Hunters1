// Bookings Service - Real API Implementation

import api from './api';
import type { Booking, BookingCreateData, BookingUpdateData, BookingListResponse } from '../types';

export const bookingsService = {
  async getBookings(params?: { 
    page?: number; 
    limit?: number; 
    status?: Booking['status'];
    property_id?: string;
  }): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.status) queryParams.append('status', params.status);
    if (params?.property_id) queryParams.append('property_id', params.property_id);
    
    const response = await api.get<BookingListResponse>(`/bookings?${queryParams}`);
    return response.data;
  },

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  async createBooking(data: BookingCreateData): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  async updateBooking(id: string, data: BookingUpdateData): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}`, data);
    return response.data;
  },

  async cancelBooking(id: string): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  },

  async confirmBooking(id: string): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/confirm`);
    return response.data;
  },

  async completeBooking(id: string): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}/complete`);
    return response.data;
  },

  async getMyBookings(): Promise<BookingListResponse> {
    const response = await api.get<BookingListResponse>('/bookings/my');
    return response.data;
  },

  async getPropertyBookings(propertyId: string): Promise<Booking[]> {
    const response = await api.get<Booking[]>(`/bookings/property/${propertyId}`);
    return response.data;
  },
};

export default bookingsService;
