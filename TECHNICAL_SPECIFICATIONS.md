# RentalHunters - Technical Specifications & Code Examples

**For Implementation Batch 1: Foundation Setup**

---

## Database Connection Implementation

### File: `src/db/index.ts`

```typescript
import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

interface DbConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  ssl: boolean;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const config: DbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rental_hunters',
  ssl: process.env.DB_SSL === 'true',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Validate required config
if (!config.password) {
  throw new Error('DB_PASSWORD environment variable is required');
}

let pool: Pool | null = null;

export function initializePool(): Pool {
  if (pool) return pool;

  pool = new Pool(config);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool() first.');
  }
  return pool;
}

export async function query(
  text: string,
  params?: (string | number | boolean | null | Date)[]
): Promise<QueryResult> {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
```

### File: `src/config/database.ts`

```typescript
import fs from 'fs';
import path from 'path';
import { query } from '../db/index';

export async function initialize(): Promise<void> {
  // Read and execute schema if tables don't exist
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  
  try {
    // Split by semicolon and execute each statement
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await query(statement);
    }
    
    console.log('✓ Database schema initialized');
  } catch (error) {
    if ((error as any).code === '42P07') {
      // Table already exists
      console.log('✓ Database schema already exists');
    } else {
      throw error;
    }
  }
}
```

---

## Authentication Implementation

### File: `src/services/auth.ts`

```typescript
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, transaction } from '../db/index';
import { v4 as uuidv4 } from 'uuid';

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
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

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

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
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
```

### File: `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
```

---

## Input Validation

### File: `src/validators/auth.ts`

```typescript
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Valid email address required',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase letter and number',
      'any.required': 'Password is required',
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),
  phone_number: Joi.string()
    .pattern(/^\+254/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be in Kenya format (+254...)',
    }),
  role: Joi.string()
    .valid('TENANT', 'LANDLORD', 'AGENT')
    .default('TENANT')
    .messages({
      'any.only': 'Invalid role',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Valid email address required',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
    }),
});
```

---

## Error Handling Middleware

### File: `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

export class ValidationError extends Error {
  status = 400;
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthError extends Error {
  status = 401;
  
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  status = 409;
  
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = error.status || 500;
  const message = error.message || 'Internal server error';

  // Log error
  logger.error({
    status,
    message,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  // Send response
  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

---

## Validation Middleware

### File: `src/middleware/validate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { ValidationError } from './errorHandler';

export function validateRequest(schema: ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details
        .map((detail) => `${detail.path.join('.')}: ${detail.message}`)
        .join('; ');
      throw new ValidationError(messages);
    }

    req.body = value;
    next();
  };
}
```

---

## Updated Auth Routes

### File: `src/routes/auth.ts` (Updated)

```typescript
import { Router, Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from '../services/auth';
import { validateRequest } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Register
router.post(
  '/register',
  validateRequest(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, phone_number, role } = req.body;
    const result = await registerUser(email, password, name, phone_number, role);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  })
);

// Login
router.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  })
);

// Refresh Token
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  })
);

// Logout
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    await logoutUser(userId);

    res.json({ message: 'Logout successful' });
  })
);

export default router;
```

---

## Updated Server

### File: `src/server.ts` (Updated)

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializePool, checkConnection, closePool } from './db';
import { initialize as initializeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import bookingRoutes from './routes/bookings';
import userRoutes from './routes/users';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'RentalHunters API is running',
    timestamp: new Date().toISOString(),
  });
});

// Database Health Check
app.get('/api/health/db', async (req: Request, res: Response) => {
  const isConnected = await checkConnection();
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? 'ok' : 'error',
    database: isConnected ? 'connected' : 'disconnected',
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
    },
  });
});

// Error Handler (MUST be last)
app.use(errorHandler);

// Initialize and Start Server
async function startServer() {
  try {
    // Initialize database connection
    initializePool();
    logger.info('Database connection pool initialized');

    // Initialize database schema
    await initializeDatabase();
    logger.info('Database initialized');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await closePool();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      await closePool();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
```

---

## Logger Setup

### File: `src/utils/logger.ts`

```typescript
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

class Logger {
  private level: 'debug' | 'info' | 'warn' | 'error';

  constructor() {
    this.level = (process.env.LOG_LEVEL as any) || 'info';
  }

  private log(level: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };

    const levelIndex = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levelIndex[level as any] >= levelIndex[this.level]) {
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: any) {
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  error(message: string | any, data?: any) {
    if (typeof message === 'string') {
      this.log('ERROR', message, data);
    } else {
      this.log('ERROR', message.message || 'Unknown error', message);
    }
  }
}

export const logger = new Logger();
```

---

## Frontend API Client

### File: `src/lib/api.ts`

```typescript
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add Auth Token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle Token Refresh
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
```

### File: `src/api/auth.ts`

```typescript
import client from '@/lib/api';

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
  role?: 'TENANT' | 'LANDLORD' | 'AGENT';
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    subscription_tier: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authAPI = {
  register: (data: RegisterPayload) =>
    client.post<AuthResponse>('/auth/register', data),

  login: (data: LoginPayload) =>
    client.post<AuthResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    client.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    ),

  logout: () => client.post('/auth/logout'),
};
```

---

## Frontend Auth Context

### File: `src/context/AuthContext.tsx`

```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  subscription_tier: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check persisted session on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (accessToken && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        localStorage.clear();
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.register({
        email,
        password,
        name,
        role: 'TENANT',
      });
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Logout anyway
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
```

### File: `src/hooks/useAuth.ts`

```typescript
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
```

---

## Updated Frontend App

### File: `src/App.tsx` (Updated - Extract)

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";

// ... imports

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path={ROUTE_PATHS.HOME} element={<Home />} />
        <Route path={ROUTE_PATHS.PROPERTIES} element={<Properties />} />
        <Route path={ROUTE_PATHS.PROPERTY_DETAIL} element={<PropertyDetail />} />
        <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTE_PATHS.SUBSCRIPTIONS} element={<Subscriptions />} />
          <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTE_PATHS.ADD_PROPERTY} element={<AddProperty />} />
          <Route path={ROUTE_PATHS.PROFILE} element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTE_PATHS.HOME} replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

### File: `src/components/ProtectedRoute.tsx` (New)

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

---

## Updated Environment Files

### Backend `.env.example`

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_hunters
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# JWT
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=dev-refresh-secret-change-in-production
REFRESH_TOKEN_EXPIRY=7d

# Logging
LOG_LEVEL=info
```

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=RentalHunters
VITE_APP_VERSION=1.0.0
```

---

## Database Change: Add Refresh Tokens Table

Add to `database/schema.sql`:

```sql
-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

---

## Package.json Updates

### Backend - Add Missing Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^9.0.7",
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0",
    "ts-node": "^10.9.2"
  }
}
```

---

## Implementation Checklist for Batch 1

- [ ] Create `src/db/index.ts` with pool management
- [ ] Create `src/config/database.ts` for initialization
- [ ] Create `src/services/auth.ts` with register/login logic
- [ ] Create `src/middleware/auth.ts` with JWT verification
- [ ] Create `src/validators/auth.ts` with Joi schemas
- [ ] Create `src/middleware/errorHandler.ts` and error classes
- [ ] Create `src/middleware/validate.ts` for request validation
- [ ] Create `src/utils/logger.ts` for logging
- [ ] Update `src/routes/auth.ts` with full implementation
- [ ] Update `src/server.ts` with middleware and initialization
- [ ] Create `src/lib/api.ts` frontend API client
- [ ] Create `src/api/auth.ts` auth endpoints wrapper
- [ ] Create `src/context/AuthContext.tsx`
- [ ] Create `src/hooks/useAuth.ts`
- [ ] Create `src/components/ProtectedRoute.tsx`
- [ ] Update `src/App.tsx` with providers and protected routes
- [ ] Update backend `.env.example`
- [ ] Update frontend `.env.example`
- [ ] Add refresh_tokens table to database schema
- [ ] Test registration flow end-to-end
- [ ] Test login flow end-to-end
- [ ] Test token refresh
- [ ] Test logout
- [ ] Test protected routes redirect

---

This should provide developers with concrete implementation guidance for Batch 1!
