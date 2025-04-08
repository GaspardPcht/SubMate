import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Dimensions de base
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Espacements
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Tailles de police
export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Tailles d'éléments
export const ELEMENT_SIZE = {
  buttonHeight: 48,
  inputHeight: 48,
  iconSize: 24,
  avatarSize: 100,
  cardBorderRadius: 12,
};

// Marges et paddings
export const LAYOUT = {
  screenPadding: SCREEN_WIDTH * 0.05,
  cardPadding: SPACING.md,
  sectionMargin: SPACING.lg,
};

// Tailles responsives
export const RESPONSIVE = {
  cardWidth: SCREEN_WIDTH * 0.9,
  chartWidth: SCREEN_WIDTH * 0.5,
  chartHeight: 160,
  tabBarHeight: Platform.OS === 'ios' ? 80 : 60,
  bottomSafeArea: Platform.OS === 'ios' ? 34 : 0, // Pour les iPhones avec notch
};

// Breakpoints pour les différentes tailles d'écran
export const BREAKPOINTS = {
  small: 320,
  medium: 375,
  large: 414,
  xlarge: 768,
}; 