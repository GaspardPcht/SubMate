import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './redux/store';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainTabNavigator';
import { ActivityIndicator, View, Dimensions, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import AuthProvider from './components/AuthProvider';
import NotificationProvider from './components/NotificationProvider';

const { width, height } = Dimensions.get('window');

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    const restoreState = async () => {
      try {
        await persistor.flush(); 
        setIsReady(true);
      } catch (error) {
        console.error('Error restoring persisted state:', error);
      }
    };

    // Configurer les listeners de notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Réponse à la notification:', response);
    });

    restoreState();

    // Nettoyage des listeners
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const isAuthenticated = useSelector((state: RootState) => !!state.auth.user);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <NotificationProvider isAuthenticated={isAuthenticated}>
            <View style={styles.container}>
              <NavigationContainer>
                <MainNavigator />
              </NavigationContainer>
            </View>
          </NotificationProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    paddingHorizontal: width * 0.05, // 5% de la largeur de l'écran
    paddingVertical: height * 0.02, // 2% de la hauteur de l'écran
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;