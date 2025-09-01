import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#e74c3c',
    primaryContainer: '#fce4e6',
    secondary: '#2c3e50',
    secondaryContainer: '#eceff1',
    tertiary: '#27ae60',
    tertiaryContainer: '#e8f5e8',
    surface: '#ffffff',
    surfaceVariant: '#f8f9fa',
    background: '#f8f9fa',
    error: '#dc3545',
    errorContainer: '#fdeaea',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#2c3e50',
    onSurfaceVariant: '#666666',
    onBackground: '#2c3e50',
    outline: '#dee2e6',
    shadow: '#000000',
    inverseSurface: '#2c3e50',
    inverseOnSurface: '#ffffff',
    inversePrimary: '#f8b4b4',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontWeight: 'bold',
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontWeight: 'bold',
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontWeight: 'bold',
    },
  },
  roundness: 12,
};