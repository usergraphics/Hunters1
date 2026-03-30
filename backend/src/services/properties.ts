import { query } from '../db/index';

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string | null;
  property_type: string;
  location: string;
  sub_location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  show_exact_location: boolean;
  primary_image: string | null;
  images: string[];
  price: number;
  bedrooms: number;
  bathrooms: number;
  total_units: number;
  available_units: number | null;
  status: string;
  is_premium: boolean;
  is_featured: boolean;
  is_active: boolean;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
}

export const propertiesService = {
  async getProperties(filters: any = {}, page: number = 1, limit: number = 10, sortBy: string = 'created_at', sortOrder: string = 'DESC'): Promise<{ data: Property[], total: number }> {
    // Whitelist allowed sort columns to prevent SQL injection
    const allowedSortColumns = ['id', 'title', 'price', 'bedrooms', 'bathrooms', 'created_at', 'updated_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let queryStr = 'SELECT * FROM properties WHERE is_active = true';
    const params: any[] = [];

    // Add text search functionality
    if (filters.search) {
      queryStr += ' AND (title ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 2) + ' OR location ILIKE $' + (params.length + 3) + ')';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.location) {
      queryStr += ' AND location ILIKE $' + (params.length + 1);
      params.push(`%${filters.location}%`);
    }

    if (filters.property_type) {
      queryStr += ' AND property_type = $' + (params.length + 1);
      params.push(filters.property_type);
    }

    if (filters.price_min !== undefined) {
      queryStr += ' AND price >= $' + (params.length + 1);
      params.push(filters.price_min);
    }

    if (filters.price_max !== undefined) {
      queryStr += ' AND price <= $' + (params.length + 1);
      params.push(filters.price_max);
    }

    if (filters.bedrooms !== undefined) {
      queryStr += ' AND bedrooms >= $' + (params.length + 1);
      params.push(filters.bedrooms);
    }

    if (filters.bathrooms !== undefined) {
      queryStr += ' AND bathrooms >= $' + (params.length + 1);
      params.push(filters.bathrooms);
    }

    if (filters.status) {
      queryStr += ' AND status = $' + (params.length + 1);
      params.push(filters.status);
    }

    if (filters.is_premium !== undefined) {
      queryStr += ' AND is_premium = $' + (params.length + 1);
      params.push(filters.is_premium);
    }

    queryStr += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;
    queryStr += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit);
    params.push((page - 1) * limit);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM properties WHERE is_active = true';
    const countParams: any[] = [];

    // Add text search to count query
    if (filters.search) {
      countQuery += ' AND (title ILIKE $' + (countParams.length + 1) + ' OR description ILIKE $' + (countParams.length + 2) + ' OR location ILIKE $' + (countParams.length + 3) + ')';
      const searchTerm = `%${filters.search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.location) {
      countQuery += ' AND location ILIKE $' + (countParams.length + 1);
      countParams.push(`%${filters.location}%`);
    }

    if (filters.property_type) {
      countQuery += ' AND property_type = $' + (countParams.length + 1);
      countParams.push(filters.property_type);
    }

    if (filters.price_min !== undefined) {
      countQuery += ' AND price >= $' + (countParams.length + 1);
      countParams.push(filters.price_min);
    }

    if (filters.price_max !== undefined) {
      countQuery += ' AND price <= $' + (countParams.length + 1);
      countParams.push(filters.price_max);
    }

    if (filters.bedrooms !== undefined) {
      countQuery += ' AND bedrooms >= $' + (countParams.length + 1);
      countParams.push(filters.bedrooms);
    }

    if (filters.bathrooms !== undefined) {
      countQuery += ' AND bathrooms >= $' + (countParams.length + 1);
      countParams.push(filters.bathrooms);
    }

    if (filters.status) {
      countQuery += ' AND status = $' + (countParams.length + 1);
      countParams.push(filters.status);
    }

    if (filters.is_premium !== undefined) {
      countQuery += ' AND is_premium = $' + (countParams.length + 1);
      countParams.push(filters.is_premium);
    }

    const totalResult = await query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].count, 10);

    const result = await query(queryStr, params);
    return { data: result.rows, total };
  },

  async getProperty(id: string): Promise<Property> {
    const result = await query('SELECT * FROM properties WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new Error('Property not found');
    }
    return result.rows[0];
  },

  async createProperty(data: Partial<Property> & { landlord_id: string }): Promise<Property> {
    const {
      landlord_id,
      title,
      description,
      property_type,
      location,
      sub_location,
      address,
      latitude,
      longitude,
      show_exact_location,
      primary_image,
      images,
      price,
      bedrooms,
      bathrooms,
      total_units,
      available_units,
      status,
      is_premium,
      is_featured,
      is_active,
      is_approved
    } = data;

    const result = await query(
      `INSERT INTO properties (
        landlord_id, title, description, property_type, location, sub_location, 
        address, latitude, longitude, show_exact_location, primary_image, images, 
        price, bedrooms, bathrooms, total_units, available_units, status, 
        is_premium, is_featured, is_active, is_approved
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *`,
      [
        landlord_id,
        title || '',
        description || null,
        property_type || '',
        location || '',
        sub_location || null,
        address || null,
        latitude || null,
        longitude || null,
        show_exact_location !== undefined ? show_exact_location : true,
        primary_image || null,
        images || [],
        price || 0,
        bedrooms || 1,
        bathrooms || 1,
        total_units || 1,
        available_units || null,
        status || 'AVAILABLE',
        is_premium !== undefined ? is_premium : false,
        is_featured !== undefined ? is_featured : false,
        is_active !== undefined ? is_active : true,
        is_approved !== undefined ? is_approved : false
      ]
    );

    return result.rows[0];
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const fields = Object.keys(data);
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Handle special case for images array
    const setParts: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (key === 'images') {
        setParts.push(`${key} = $${setParts.length + 2}`);
        values.push(value);
      } else {
        setParts.push(`${key} = $${setParts.length + 2}`);
        values.push(value);
      }
    }

    const setClause = setParts.join(', ');

    const result = await query(
      `UPDATE properties SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      throw new Error('Property not found');
    }

    return result.rows[0];
  },

  async deleteProperty(id: string): Promise<void> {
    const result = await query('DELETE FROM properties WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      throw new Error('Property not found');
    }
  },

  async getMyProperties(landlordId: string): Promise<Property[]> {
    const result = await query(
      'SELECT * FROM properties WHERE landlord_id = $1 AND is_active = true ORDER BY created_at DESC',
      [landlordId]
    );
    return result.rows;
  },

  async toggleFavorite(propertyId: string, userId: string): Promise<{ isFavorite: boolean }> {
    // Check if already favorited
    const existing = await query(
      'SELECT id FROM saved_properties WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    if (existing.rows.length > 0) {
      // Remove from favorites
      await query('DELETE FROM saved_properties WHERE user_id = $1 AND property_id = $2', [userId, propertyId]);
      return { isFavorite: false };
    } else {
      // Add to favorites
      await query(
        'INSERT INTO saved_properties (user_id, property_id) VALUES ($1, $2)',
        [userId, propertyId]
      );
      return { isFavorite: true };
    }
  },

  async getFavorites(userId: string): Promise<Property[]> {
    const result = await query(
      `SELECT p.* FROM properties p 
       JOIN saved_properties sp ON p.id = sp.property_id 
       WHERE sp.user_id = $1 AND p.is_active = true
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows;
  }
};