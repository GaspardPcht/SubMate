import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { View } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/redux/store';
import { RootStackParamList } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AddSubscriptionScreen from './src/screens/AddSubscriptionScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import SupportScreen from './src/screens/SupportScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './src/services/api';
import { useAppSelector } from './src/redux/hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#377AF2',
    secondary: '#377AF2',
  },
};

function NavigationContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // On considère que l'utilisateur est authentifié s'il a un token
        // La vérification complète sera faite lors des requêtes API
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#377AF2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' }
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <AlertNotificationRoot>
          <NavigationContent />
        </AlertNotificationRoot>
      </PaperProvider>
    </ReduxProvider>
  );
} 