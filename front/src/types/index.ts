import { CategoryKey } from '../constants/categories';
import { BillingCycle } from './subscription';

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  token: string;
}

export interface Subscription {
  _id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  category: CategoryKey;
  userId: string;
  createdAt: string;
  updatedAt: string;
  nextBillingDate: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SubscriptionsState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

export interface UserPreferencesState {
  notificationsEnabled: boolean;
  reminderDays: number;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  subscriptions: SubscriptionsState;
  userPreferences: UserPreferencesState;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  EditProfile: undefined;
  Support: undefined;
  AddSubscription: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Budget: undefined;
  Profile: undefined;
  Support: undefined;
}; 