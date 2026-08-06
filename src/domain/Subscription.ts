export type PlanType = 'free' | 'hero' | 'professional' | 'legendary';

export interface SubscriptionLimits {
  maxStoriesPerMonth: number;
  maxVideosPerMonth: number;
  maxCharacters: number;
}

export interface UserSubscription {
  planType: PlanType;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'free_tier';
  currentPeriodStart: string; // ISO String
  currentPeriodEnd: string;   // ISO String
  usage: {
    storiesCreatedThisPeriod: number;
    videosCreatedThisPeriod: number;
    taceCreditsConsumed?: number;
  };
  cancelAtPeriodEnd: boolean;
  paymentMethod?: 'pix' | 'credit_card';
  billingCycle: 'mensal' | 'anual';
  oneTimeCredits?: number; // Balance of single story purchase credits
}

export const PLAN_LIMITS: Record<PlanType, SubscriptionLimits> = {
  free: {
    maxStoriesPerMonth: 2,
    maxVideosPerMonth: 0,
    maxCharacters: 2
  },
  hero: {
    maxStoriesPerMonth: 15,
    maxVideosPerMonth: 3,
    maxCharacters: 5
  },
  professional: {
    maxStoriesPerMonth: 50,
    maxVideosPerMonth: 15,
    maxCharacters: 10
  },
  legendary: {
    maxStoriesPerMonth: 150, // 150 stories per month limit
    maxVideosPerMonth: 35,
    maxCharacters: 15
  }
};
