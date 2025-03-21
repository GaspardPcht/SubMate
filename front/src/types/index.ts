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
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: string;
  userId: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  Add: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Budget: undefined;
  Profile: undefined;
}; 