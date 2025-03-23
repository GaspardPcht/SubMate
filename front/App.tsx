import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/redux/store';
import { RootStackParamList } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import AddSubscriptionScreen from './src/screens/AddSubscriptionScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import SupportScreen from './src/screens/SupportScreen';
import RegisterScreen from './src/screens/RegisterScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#377AF2',
    secondary: '#377AF2',
  },
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <AlertNotificationRoot>
          <NavigationContainer>
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
                contentStyle: { backgroundColor: '#fff' }
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AlertNotificationRoot>
      </PaperProvider>
    </ReduxProvider>
  );
} 