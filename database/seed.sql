-- RentalHunters Seed Data
-- Sample data for development and testing

-- Insert sample users (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, name, phone_number, role, subscription_tier, is_phone_verified) VALUES
    ('john@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'John Doe', '+254700123456', 'LANDLORD', 'MANAGER', true),
    ('jane@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Jane Smith', '+254700234567', 'TENANT', 'FREE', true),
    ('admin@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Admin User', '+254700000000', 'ADMIN', 'ESTATE', true);

-- Insert sample properties
INSERT INTO properties (landlord_id, title, description, property_type, location, sub_location, address, latitude, longitude, price, bedrooms, bathrooms, total_units, available_units, status, is_premium, is_featured, is_approved, primary_image, images) VALUES
    ((SELECT id FROM users WHERE email='john@example.com'), 'Modern Apartment in Ongata Rongai', 'Beautiful modern apartment with open-plan living, modern kitchen, and ample natural light. Perfect for young professionals.', 'apartment', 'Ongata Rongai', 'Kware', 'Kware Road, Near St. Mary''s School', -1.3887, 36.7812, 25000, 2, 1, 4, 2, 'AVAILABLE', true, true, true, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),

    ((SELECT id FROM users WHERE email='john@example.com'), 'Cozy Bedsitter near Kiserian', 'Affordable bedsitter in a quiet neighborhood. Includes basic amenities and secure parking.', 'bedsitter', 'Kiserian', 'Town', 'Kiserian Town Center', -1.4356, 36.9567, 12000, 1, 1, 6, 4, 'AVAILABLE', false, false, true, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800']),

    ((SELECT id FROM users WHERE email='john@example.com'), 'Spacious 3BR House with Garden', 'Large family house with beautiful garden, secure compound, and ample parking space.', 'house', 'Ngong', 'Kibera', 'Ngong Road, Kibera', -1.3125, 36.8125, 45000, 3, 2, 1, 0, 'OCCUPIED', true, true, true, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']),

    ((SELECT id FROM users WHERE email='john@example.com'), 'Luxury Villa with Pool', 'Premium villa with private pool, modern finishes, and 24/7 security. Located in exclusive Karen area.', 'villa', 'Karen', 'Langata', 'Karen Road, Langata', -1.3236, 36.7178, 85000, 4, 3, 1, 1, 'AVAILABLE', true, true, true, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']),

    ((SELECT id FROM users WHERE email='john@example.com'), 'Studio Apartment - Kilimani', 'Modern studio in the heart of Kilimani. Walking distance to malls and restaurants.', 'studio', 'Kilimani', 'Muthangari', 'Muthangari Drive', -1.2935, 36.7856, 18000, 1, 1, 10, 6, 'AVAILABLE', false, false, true, 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400', ARRAY['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800']),

    ((SELECT id FROM users WHERE email='john@example.com'), 'Single Room - Magadi Road', 'Budget-friendly single room on Magadi Road. Good transport connectivity.', 'single', 'Ongata Rongai', 'Mbagathi', 'Magadi Road, Mbagathi', -1.4123, 36.8234, 8000, 1, 1, 12, 8, 'AVAILABLE', false, false, true, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400', ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800']);

-- Insert sample bookings
INSERT INTO bookings (property_id, tenant_id, landlord_id, viewing_date, viewing_time, status) VALUES
    ((SELECT id FROM properties WHERE title='Modern Apartment in Ongata Rongai' LIMIT 1), (SELECT id FROM users WHERE email='jane@example.com'), (SELECT id FROM users WHERE email='john@example.com'), '2026-03-05', '10:00:00', 'PENDING'),
    ((SELECT id FROM properties WHERE title='Cozy Bedsitter near Kiserian' LIMIT 1), (SELECT id FROM users WHERE email='jane@example.com'), (SELECT id FROM users WHERE email='john@example.com'), '2026-03-06', '14:00:00', 'CONFIRMED');

-- Insert sample subscriptions
INSERT INTO subscriptions (user_id, tier, start_date, end_date, is_active) VALUES
    ((SELECT id FROM users WHERE email='john@example.com'), 'MANAGER', '2026-01-01', '2027-01-01', true),
    ((SELECT id FROM users WHERE email='jane@example.com'), 'FREE', '2026-01-01', NULL, true),
    ((SELECT id FROM users WHERE email='admin@example.com'), 'ESTATE', '2026-01-01', '2027-01-01', true);
