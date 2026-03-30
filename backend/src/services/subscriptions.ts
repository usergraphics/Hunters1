// Subscriptions Service - Backend

import { query } from '../db/index';

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'FREE' | 'STARTER' | 'VERIFIED' | 'MANAGER' | 'PRIORITY' | 'ESTATE';
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  tier: string;
  name: string;
  price: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS = {
  tenant: [
    { tier: 'FREE', name: 'Free', price: 0, features: ['Basic property search', 'Up to 5 saved properties', 'Basic messaging'] },
    { tier: 'STARTER', name: 'Starter', price: 999, features: ['Unlimited property search', 'Up to 20 saved properties', 'Priority messaging', 'Email support'] },
    { tier: 'VERIFIED', name: 'Verified', price: 2499, features: ['Unlimited everything', 'Verified badge', 'Instant notifications', 'Phone support'] },
  ],
  landlord: [
    { tier: 'FREE', name: 'Free', price: 0, features: ['Post 1 property', 'Basic analytics', 'Standard messaging'] },
    { tier: 'MANAGER', name: 'Manager', price: 4999, features: ['Post up to 10 properties', 'Advanced analytics', 'Priority support', 'Featured listings'] },
    { tier: 'ESTATE', name: 'Estate', price: 9999, features: ['Unlimited properties', 'Premium analytics', '24/7 support', 'Top placement'] },
  ],
};

export const subscriptionsService = {
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const result = await query(
      `SELECT * FROM subscriptions WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  },

  async getUserByTier(userId: string): Promise<string> {
    const result = await query(
      'SELECT subscription_tier FROM users WHERE id = $1',
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0].subscription_tier : 'FREE';
  },

  async createSubscription(userId: string, tier: string): Promise<Subscription> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const result = await query(
      `INSERT INTO subscriptions (user_id, tier, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING *`,
      [userId, tier, startDate, endDate]
    );

    // Update user's subscription_tier
    await query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      [tier, userId]
    );

    return result.rows[0];
  },

  async cancelSubscription(userId: string): Promise<void> {
    await query(
      'UPDATE subscriptions SET is_active = FALSE WHERE user_id = $1 AND is_active = TRUE',
      [userId]
    );

    // Revert user to FREE tier
    await query(
      'UPDATE users SET subscription_tier = $1 WHERE id = $2',
      ['FREE', userId]
    );
  },

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    // This would typically return plans from a database
    return SUBSCRIPTION_PLANS.tenant; // Default to tenant plans
  },

  async getFeaturesByTier(tier: string): Promise<string[]> {
    const allPlans = [...SUBSCRIPTION_PLANS.tenant, ...SUBSCRIPTION_PLANS.landlord];
    const plan = allPlans.find((p) => p.tier === tier);
    return plan?.features || [];
  },
};

export default subscriptionsService;