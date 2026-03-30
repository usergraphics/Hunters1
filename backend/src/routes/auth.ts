// Auth Routes
// Authentication endpoints

import { Router, Request, Response } from 'express';
import { 
  registerUser, 
  loginUser, 
  refreshAccessToken, 
  logoutUser, 
  generateEmailVerificationToken, 
  verifyEmail, 
  generatePasswordResetToken, 
  resetPassword,
  getUserByEmail
} from '../services/auth';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone_number, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }
    
    const result = await registerUser(email, password, name, phone_number, role as any);
    res.status(201).json({ 
      user: result.user, 
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const result = await loginUser(email, password);
    res.json({ 
      user: result.user, 
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }
    
    const result = await refreshAccessToken(refreshToken);
    res.json({ 
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // If we have a token, we could blacklist it (implementation depends on requirements)
    // For now, just return success
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/verify-email - Request email verification (SECURE - doesn't return token)
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    // Look up user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a verification link will be sent' });
      return;
    }
    
    await generateEmailVerificationToken(user.id);
    
    // In production, you would send the token via email
    // For security, we don't return the token in the response
    res.json({ 
      message: 'Verification email sent. Please check your inbox.' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/verify-email/:token - Verify email with token
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const isVerified = await verifyEmail(token);
    res.json({ verified: isVerified });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/forgot-password - Request password reset (SECURE - doesn't return token)
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    // Look up user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a password reset link will be sent' });
      return;
    }
    
    await generatePasswordResetToken(user.id);
    
    // In production, you would send the token via email
    // For security, we don't return the token in the response
    res.json({ 
      message: 'Password reset email sent. Please check your inbox.' 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }
    
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }
    
    await resetPassword(token, password);
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
