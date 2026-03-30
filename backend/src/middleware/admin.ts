// Admin Authorization Middleware
// Checks if user has admin privileges

import { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from './auth';

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};

export const requireLandlordOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!['LANDLORD', 'ADMIN', 'AGENT'].includes(req.user.role)) {
    res.status(403).json({ error: 'Landlord or admin access required' });
    return;
  }

  next();
};

export const requireOwnershipOrAdmin = (
  getOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Admins can access any resource
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    // Get the owner ID of the resource
    const ownerId = await getOwnerId(req);
    
    if (!ownerId) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Check if user owns the resource
    if (ownerId !== req.user.userId) {
      res.status(403).json({ error: 'You do not have permission to access this resource' });
      return;
    }

    next();
  };
};