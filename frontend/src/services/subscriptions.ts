// Subscriptions Service - Frontend

import api from './api';

export interface SubscriptionPlan {
  tier: string;
  name: string;
  price: number;
  features: string[];
}

export interface UserSubscription {
  subscription: {
    id: string;
    tier: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
  } | null;
  tier: string;
  features: string[];
}

export const subscriptionsService = {
  async getPlans(userType: 'tenant' | 'landlord' = 'tenant'): Promise<SubscriptionPlan[]> {
    const response = await api.get<SubscriptionPlan[]>(`/subscriptions/plans?type=${userType}`);
    return response.data;
  },

  async getCurrentSubscription(): Promise<UserSubscription> {
    const response = await api.get<UserSubscription>('/subscriptions/current');
    return response.data;
  },

  async subscribe(tier: string): Promise<any> {
    const response = await api.post('/subscriptions', { tier });
    return response.data;
  },

  async cancelSubscription(): Promise<void> {
    await api.delete('/subscriptions');
  },

  async getFeatures(tier: string): Promise<string[]> {
    const response = await api.get<{ features: string[] }>(`/subscriptions/features/${tier}`);
    return response.data.features;
  }
};

export default subscriptionsService;