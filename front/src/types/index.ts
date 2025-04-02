import { ViewStyle, TextStyle, ViewProps } from 'react-native';
import { CategoryKey } from '../constants/categories';
import { BillingCycle } from './subscription';

declare module 'react-native-paper' {
  export interface Theme {
    colors: {
      primary: string;
      [key: string]: string;
    };
  }

  export function useTheme(): Theme;

  export interface ButtonProps {
    mode?: 'text' | 'outlined' | 'contained';
    onPress?: () => void;
    style?: ViewStyle;
    loading?: boolean;
    textColor?: string;
    icon?: string;
    children: React.ReactNode;
  }

  export interface TextProps {
    style?: TextStyle;
    children: React.ReactNode;
  }

  export interface IconButtonProps {
    icon: string;
    size?: number;
    onPress?: () => void;
    iconColor?: string;
  }

  export interface SurfaceProps {
    style?: ViewStyle;
    elevation?: number;
    children: React.ReactNode;
  }

  export interface DialogProps {
    visible: boolean;
    onDismiss: () => void;
    children: React.ReactNode;
  }

  export interface DialogTitleProps {
    children: React.ReactNode;
  }

  export interface DialogContentProps {
    children: React.ReactNode;
  }

  export interface DialogActionsProps {
    children: React.ReactNode;
  }

  export interface TextInputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    right?: React.ReactNode;
  }

  export interface TextInputIconProps {
    icon: string;
    onPress?: () => void;
    color?: string;
  }

  export const Button: React.FC<ButtonProps>;
  export const Text: React.FC<TextProps>;
  export const IconButton: React.FC<IconButtonProps>;
  export const Surface: React.FC<SurfaceProps>;
  export const Portal: React.FC<{ children: React.ReactNode }>;
  export const Dialog: React.FC<DialogProps> & {
    Title: React.FC<DialogTitleProps>;
    Content: React.FC<DialogContentProps>;
    Actions: React.FC<DialogActionsProps>;
  };
  export const TextInput: React.FC<TextInputProps> & {
    Icon: React.FC<TextInputIconProps>;
  };
}

declare module 'react-native-safe-area-context' {
  export interface SafeAreaViewProps extends ViewProps {
    children: React.ReactNode;
  }

  export const SafeAreaView: React.FC<SafeAreaViewProps>;
}

declare module 'react-native-alert-notification' {
  export enum ALERT_TYPE {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WARNING = 'WARNING',
    INFO = 'INFO',
    DANGER = 'DANGER'
  }

  export interface ToastOptions {
    type: ALERT_TYPE;
    title: string;
    textBody: string;
  }

  export const Toast: {
    show: (options: ToastOptions) => void;
  };
}

declare module '@env' {
  export const API_URL: string;
  export const EXPO_PUBLIC_API_URL: string;
}

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
  token: string | null;
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

export * from './custom'; 