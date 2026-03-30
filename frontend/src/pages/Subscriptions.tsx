// Subscriptions Page - Real API Implementation

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Building, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import subscriptionsService, { type SubscriptionPlan } from '@/services/subscriptions';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user } = useAuthStore();

  // Determine user type based on role
  const userType = user?.role === 'TENANT' ? 'tenant' : 'landlord';

  useEffect(() => {
    loadPlans();
    loadCurrentSubscription();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await subscriptionsService.getPlans(userType);
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await subscriptionsService.getCurrentSubscription();
      setCurrentTier(subscription.tier);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handleSubscribe = async (tier: string) => {
    try {
      setIsSubscribing(true);
      await subscriptionsService.subscribe(tier);
      setCurrentTier(tier);
      setSelectedPlan(null);
      alert('Subscription updated successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getIcon = (tier: string) => {
    switch (tier) {
      case 'FREE':
      case 'STARTER':
        return Building;
      case 'VERIFIED':
      case 'MANAGER':
        return Sparkles;
      case 'PRIORITY':
      case 'ESTATE':
        return Crown;
      default:
        return Building;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your needs
        </p>
        {currentTier !== 'FREE' && (
          <Badge className="mt-4" variant="outline">
            Current Plan: {currentTier}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const Icon = getIcon(plan.tier);
          const isPopular = plan.tier === 'VERIFIED' || plan.tier === 'MANAGER';
          const isCurrentPlan = currentTier === plan.tier;

          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative h-full ${isPopular ? 'border-primary ring-2 ring-primary/20' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500/20' : ''}`}>
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                    Current Plan
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.tier}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">KSh {plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-left mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.price === 0 ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={isSubscribing}
                    >
                      {isSubscribing && selectedPlan === plan.tier ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Already On Free
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isPopular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={isSubscribing}
                    >
                      {isSubscribing && selectedPlan === plan.tier ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Subscribe Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="grid gap-4">
            <div>
              <h4 className="font-medium mb-1">Can I change my plan later?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept M-Pesa, credit/debit cards, and bank transfers.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Is there a free trial?</h4>
              <p className="text-sm text-muted-foreground">
                The Free tier is available indefinitely. Premium plans come with a 7-day money-back guarantee.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
