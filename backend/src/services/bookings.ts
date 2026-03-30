import { query } from '../db/index';

export interface Booking {
  id: string;
  property_id: string;
  unit_id: string | null;
  tenant_id: string;
  landlord_id: string | null;
  viewing_date: string; // DATE type as string
  viewing_time: string; // TIME type as string
  status: string;
  notes: string | null;
  is_priority: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BookingCreateData {
  property_id: string;
  unit_id: string | null;
  tenant_id: string;
  viewing_date: string;
  viewing_time: string;
  notes?: string;
  is_priority?: boolean;
}

export const bookingsService = {
  async getBookings(filters: any = {}): Promise<Booking[]> {
    let queryStr = 'SELECT * FROM bookings WHERE 1=1';
    const params: any[] = [];

    if (filters.property_id) {
      queryStr += ' AND property_id = $' + (params.length + 1);
      params.push(filters.property_id);
    }

    if (filters.tenant_id) {
      queryStr += ' AND tenant_id = $' + (params.length + 1);
      params.push(filters.tenant_id);
    }

    if (filters.landlord_id) {
      queryStr += ' AND landlord_id = $' + (params.length + 1);
      params.push(filters.landlord_id);
    }

    if (filters.status) {
      queryStr += ' AND status = $' + (params.length + 1);
      params.push(filters.status);
    }

    if (filters.viewing_date) {
      queryStr += ' AND viewing_date = $' + (params.length + 1);
      params.push(filters.viewing_date);
    }

    if (filters.is_priority !== undefined) {
      queryStr += ' AND is_priority = $' + (params.length + 1);
      params.push(filters.is_priority);
    }

    queryStr += ' ORDER BY created_at DESC';

    const result = await query(queryStr, params);
    return result.rows;
  },

  async getBooking(id: string): Promise<Booking> {
    const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }
    return result.rows[0];
  },

  async createBooking(data: BookingCreateData): Promise<Booking> {
    const {
      property_id,
      unit_id,
      tenant_id,
      viewing_date,
      viewing_time,
      notes,
      is_priority
    } = data;

    // For now, we'll set landlord_id from the property - in a real app, you'd fetch this
    // But for simplicity, we'll leave it nullable and it can be updated later
    const result = await query(
      `INSERT INTO bookings (
        property_id, unit_id, tenant_id, landlord_id, viewing_date, viewing_time, 
        status, notes, is_priority
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *`,
      [
        property_id,
        unit_id || null,
        tenant_id,
        null, // landlord_id - would be fetched from property in real implementation
        viewing_date,
        viewing_time,
        'PENDING', // default status
        notes || null,
        is_priority !== undefined ? is_priority : false
      ]
    );

    return result.rows[0];
  },

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const fields = Object.keys(data);
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Handle special cases for date/time fields
    const setParts: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      setParts.push(`${key} = $${setParts.length + 2}`);
      values.push(value);
    }

    const setClause = setParts.join(', ');

    const result = await query(
      `UPDATE bookings SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    return result.rows[0];
  },

  async deleteBooking(id: string): Promise<void> {
    const result = await query('DELETE FROM bookings WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      throw new Error('Booking not found');
    }
  },

  async cancelBooking(id: string): Promise<Booking> {
    return await this.updateBooking(id, { status: 'CANCELLED' });
  },

  async confirmBooking(id: string): Promise<Booking> {
    return await this.updateBooking(id, { status: 'CONFIRMED' });
  },

  async completeBooking(id: string): Promise<Booking> {
    return await this.updateBooking(id, { status: 'COMPLETED' });
  },

  async getMyBookings(tenantId: string): Promise<Booking[]> {
    const result = await query(
      'SELECT * FROM bookings WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return result.rows;
  },

  async getPropertyBookings(propertyId: string): Promise<Booking[]> {
    const result = await query(
      'SELECT * FROM bookings WHERE property_id = $1 ORDER BY created_at DESC',
      [propertyId]
    );
    return result.rows;
  }
};