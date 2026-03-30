// Bookings Routes
// All protected routes require authentication

import { Router, Request, Response } from 'express';
import { bookingsService } from '../services/bookings';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/bookings - Protected - List bookings (filtered by user role)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      property_id: req.query.property_id as string | undefined,
      tenant_id: req.query.tenant_id as string | undefined,
      landlord_id: req.query.landlord_id as string | undefined,
      status: req.query.status as string | undefined,
      viewing_date: req.query.viewing_date as string | undefined,
      is_priority: req.query.is_priority === 'true' ? true : req.query.is_priority === 'false' ? false : undefined
    };
    
    // Filter by role
    if (req.user?.role === 'TENANT') {
      filters.tenant_id = req.user.userId;
    } else if (['LANDLORD', 'AGENT'].includes(req.user?.role || '')) {
      filters.landlord_id = req.user?.userId;
    }
    // ADMIN can see all
    
    const bookings = await bookingsService.getBookings(filters);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/my - Protected - Get current user's bookings as tenant
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await bookingsService.getMyBookings(req.user!.userId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/property/:propertyId - Protected - Get bookings for a property (landlord only)
router.get('/property/:propertyId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await bookingsService.getPropertyBookings(req.params.propertyId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/:id - Protected - Get single booking
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await bookingsService.getBooking(req.params.id);
    
    // Check access
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    if (userRole !== 'ADMIN' && 
        booking.tenant_id !== userId && 
        booking.landlord_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    res.json(booking);
  } catch (error: any) {
    if (error.message === 'Booking not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /api/bookings - Protected - Create new booking
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bookingData = {
      ...req.body,
      tenant_id: req.user!.userId
    };
    
    const booking = await bookingsService.createBooking(bookingData);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/bookings/:id - Protected - Update booking
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await bookingsService.getBooking(req.params.id);
    
    // Check access - only tenant or landlord can update
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    if (userRole !== 'ADMIN' && 
        booking.tenant_id !== userId && 
        booking.landlord_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const updated = await bookingsService.updateBooking(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    if (error.message === 'Booking not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'No fields to update') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PATCH /api/bookings/:id/cancel - Protected - Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await bookingsService.getBooking(req.params.id);
    
    // Check access
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    if (userRole !== 'ADMIN' && 
        booking.tenant_id !== userId && 
        booking.landlord_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const updated = await bookingsService.cancelBooking(req.params.id);
    res.json(updated);
  } catch (error: any) {
    if (error.message === 'Booking not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PATCH /api/bookings/:id/confirm - Protected - Confirm booking (landlord only)
router.patch('/:id/confirm', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Only landlords and admins can confirm
    if (!['LANDLORD', 'ADMIN', 'AGENT'].includes(req.user?.role || '')) {
      res.status(403).json({ error: 'Landlord access required' });
      return;
    }
    
    const booking = await bookingsService.getBooking(req.params.id);
    
    // Verify landlord owns the property
    if (booking.landlord_id !== req.user?.userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const confirmed = await bookingsService.confirmBooking(req.params.id);
    res.json(confirmed);
  } catch (error: any) {
    if (error.message === 'Booking not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PATCH /api/bookings/:id/complete - Protected - Mark booking as completed
router.patch('/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await bookingsService.getBooking(req.params.id);
    
    // Check access
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    if (userRole !== 'ADMIN' && 
        booking.tenant_id !== userId && 
        booking.landlord_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    const completed = await bookingsService.completeBooking(req.params.id);
    res.json(completed);
  } catch (error: any) {
    if (error.message === 'Booking not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
