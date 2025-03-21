export interface User {
  id: string;
  name: string;
  email: string;
  totalSubscriptions: number;
  monthlyTotal: number;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Add: undefined;
  Profile: undefined;
}; 