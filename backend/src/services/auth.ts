import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, transaction } from '../db/index';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'TENANT' | 'LANDLORD' | 'AGENT' | 'ADMIN';
  subscription_tier: string;
  is_phone_verified: boolean;
  is_id_verified: boolean;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
const JWT_EXPIRY: string | number = process.env.JWT_EXPIRY || '24h';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
const REFRESH_EXPIRY: string | number = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export async function registerUser(
  email: string,
  password: string,
  name: string,
  phone_number?: string,
  role: 'TENANT' | 'LANDLORD' | 'AGENT' = 'TENANT'
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  // Check if user exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcryptjs.hash(password, 10);

  // Create user
  const userId = uuidv4();
  const result = await query(
    `INSERT INTO users (id, email, password_hash, name, phone_number, role, subscription_tier)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, name, role, subscription_tier, is_phone_verified, is_id_verified`,
    [userId, email, hashedPassword, name, phone_number, role, 'FREE']
  );

  const user = result.rows[0] as User;

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ]
  );

  return { user, accessToken, refreshToken };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  // Find user
  const result = await query(
    `SELECT id, email, name, password_hash, role, subscription_tier, 
            is_phone_verified, is_id_verified FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const userRecord = result.rows[0];

  // Verify password
  const passwordMatch = await bcryptjs.compare(
    password,
    userRecord.password_hash
  );

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  await query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [userRecord.id]
  );

  const user: User = {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    role: userRecord.role,
    subscription_tier: userRecord.subscription_tier,
    is_phone_verified: userRecord.is_phone_verified,
    is_id_verified: userRecord.is_id_verified,
  };

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ]
  );

  return { user, accessToken, refreshToken };
}

export function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
}

export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as JWTPayload;

    // Verify token exists in database
    const result = await query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Refresh token not found or expired');
    }

    // Get user
    const userResult = await query(
      'SELECT id, email, name, role, subscription_tier FROM users WHERE id = $1',
      [payload.userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token
    await query(
      'UPDATE refresh_tokens SET token = $1, expires_at = $2 WHERE user_id = $3',
      [
        newRefreshToken,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user.id,
      ]
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

export async function logoutUser(userId: string): Promise<void> {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

export async function generateEmailVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await query(
    'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
  
  return token;
}

export async function verifyEmail(token: string): Promise<boolean> {
  const result = await query(
    'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1',
    [token]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid verification token');
  }
  
  const tokenRecord = result.rows[0];
  const expiresAt = new Date(tokenRecord.expires_at);
  
  if (expiresAt < new Date()) {
    await query('DELETE FROM email_verification_tokens WHERE token = $1', [token]);
    throw new Error('Verification token has expired');
  }
  
  // Mark user as verified
  await query(
    'UPDATE users SET is_phone_verified = TRUE, verification_status = \'VERIFIED\' WHERE id = $1',
    [tokenRecord.user_id]
  );
  
  // Delete used token
  await query('DELETE FROM email_verification_tokens WHERE token = $1', [token]);
  
  return true;
}

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
  
  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const result = await query(
    'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1',
    [token]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid password reset token');
  }
  
  const tokenRecord = result.rows[0];
  const expiresAt = new Date(tokenRecord.expires_at);
  
  if (expiresAt < new Date()) {
    await query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
    throw new Error('Password reset token has expired');
  }
  
  // Hash new password
  const hashedPassword = await bcryptjs.hash(newPassword, 10);
  
  // Update password
  await query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [hashedPassword, tokenRecord.user_id]
  );
  
  // Delete used token
  await query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    'SELECT id, email, name, role, subscription_tier, is_phone_verified, is_id_verified FROM users WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0] as User;
}