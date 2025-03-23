import { CategoryKey } from '../constants/categories';

export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  _id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  category: CategoryKey;
  userId: string;
  createdAt: string;
  updatedAt: string;
} 