// Properties Routes
// All protected routes require authentication

import { Router, Request, Response } from 'express';
import { propertiesService } from '../services/properties';
import { authenticateToken, optionalAuth, requireLandlordOrAdmin, type AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/properties - Public - List all properties with filters
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const filters = {
      location: req.query.location as string | undefined,
      property_type: req.query.property_type as string | undefined,
      price_min: req.query.price_min ? parseFloat(req.query.price_min as string) : undefined,
      price_max: req.query.price_max ? parseFloat(req.query.price_max as string) : undefined,
      bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
      bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
      status: req.query.status as string | undefined,
      is_premium: req.query.is_premium === 'true' ? true : req.query.is_premium === 'false' ? false : undefined,
      search: req.query.search as string | undefined
    };
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'DESC';
    
    const result = await propertiesService.getProperties(filters, page, limit, sortBy, sortOrder);
    res.json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/properties/favorites/:userId - Protected - Get user's favorite properties
router.get('/favorites/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own favorites
    if (req.user?.userId !== userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const favorites = await propertiesService.getFavorites(userId);
    res.json(favorites);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/properties/my - Protected - Get landlord's properties
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!['LANDLORD', 'ADMIN', 'AGENT'].includes(req.user?.role || '')) {
      res.status(403).json({ error: 'Landlord access required' });
      return;
    }
    
    const properties = await propertiesService.getMyProperties(req.user!.userId);
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/properties/:id - Public - Get single property
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const property = await propertiesService.getProperty(req.params.id);
    res.json(property);
  } catch (error: any) {
    if (error.message === 'Property not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/properties - Protected - Create new property
router.post('/', authenticateToken, requireLandlordOrAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const propertyData = {
      ...req.body,
      landlord_id: req.user!.userId
    };
    
    const property = await propertiesService.createProperty(propertyData);
    res.status(201).json(property);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/properties/:id - Protected - Update property
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Check ownership or admin
    const property = await propertiesService.getProperty(req.params.id);
    
    if (property.landlord_id !== req.user?.userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'You can only edit your own properties' });
      return;
    }
    
    const updated = await propertiesService.updateProperty(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.message === 'Property not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'No fields to update') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE /api/properties/:id - Protected - Delete property
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Check ownership or admin
    const property = await propertiesService.getProperty(req.params.id);
    
    if (property.landlord_id !== req.user?.userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'You can only delete your own properties' });
      return;
    }
    
    await propertiesService.deleteProperty(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Property not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/properties/:id/favorite - Protected - Toggle favorite
router.post('/:id/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const propertyId = req.params.id;
    
    const result = await propertiesService.toggleFavorite(propertyId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/properties/:id/approve - Admin only - Approve property
router.patch('/:id/approve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    
    const property = await propertiesService.updateProperty(req.params.id, { is_approved: true });
    res.json(property);
  } catch (error: any) {
    if (error.message === 'Property not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
