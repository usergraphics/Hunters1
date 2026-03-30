import { Router, Request, Response } from 'express';
import { query } from '../db/index';
import { verifyAccessToken } from '../services/auth';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const router = Router();

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await query(
      'SELECT id, email, name, role, subscription_tier, is_phone_verified, is_id_verified, created_at, updated_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatar: '', // Would come from avatar_url in real implementation
      role: user.role.toLowerCase() as 'tenant' | 'landlord' | 'admin',
      phone: user.phone_number || undefined,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { firstName, lastName, phone } = req.body;
    const name = `${firstName} ${lastName}`.trim();

    const result = await query(
      'UPDATE users SET name = $1, phone_number = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, name, role, subscription_tier, is_phone_verified, is_id_verified, created_at, updated_at',
      [name, phone || null, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatar: '', // Would come from avatar_url in real implementation
      role: user.role.toLowerCase() as 'tenant' | 'landlord' | 'admin',
      phone: user.phone_number || undefined,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, subscription_tier, is_phone_verified, is_id_verified, created_at, updated_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0] || '',
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      avatar: '', // Would come from avatar_url in real implementation
      role: user.role.toLowerCase() as 'tenant' | 'landlord' | 'admin',
      phone: user.phone_number || undefined,
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
