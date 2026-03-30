// Subscriptions Routes

import { Router, Response } from 'express';
import { subscriptionsService, SUBSCRIPTION_PLANS } from '../services/subscriptions';
import { authenticateToken, type AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/subscriptions/plans - Public - Get all subscription plans
router.get('/plans', (req, res) => {
  const userType = req.query.type as string || 'tenant';
  const plans = userType === 'landlord' ? SUBSCRIPTION_PLANS.landlord : SUBSCRIPTION_PLANS.tenant;
  res.json(plans);
});

// GET /api/subscriptions/current - Protected - Get current user's subscription
router.get('/current', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const subscription = await subscriptionsService.getUserSubscription(userId);
    const tier = await subscriptionsService.getUserByTier(userId);
    const features = await subscriptionsService.getFeaturesByTier(tier);
    
    res.json({
      subscription,
      tier,
      features,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/subscriptions - Protected - Subscribe to a plan
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { tier } = req.body;
    const userId = req.user!.userId;
    
    if (!tier) {
      res.status(400).json({ error: 'Tier is required' });
      return;
    }
    
    // Validate tier
    const allPlans = [...SUBSCRIPTION_PLANS.tenant, ...SUBSCRIPTION_PLANS.landlord];
    if (!allPlans.find((p) => p.tier === tier)) {
      res.status(400).json({ error: 'Invalid subscription tier' });
      return;
    }
    
    const subscription = await subscriptionsService.createSubscription(userId, tier);
    res.status(201).json(subscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/subscriptions - Protected - Cancel subscription
router.delete('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await subscriptionsService.cancelSubscription(userId);
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subscriptions/features/:tier - Public - Get features for a tier
router.get('/features/:tier', async (req, res) => {
  try {
    const features = await subscriptionsService.getFeaturesByTier(req.params.tier);
    res.json({ features });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;