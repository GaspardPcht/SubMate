import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainTabNavigator'; // Vérifiez que ce chemin est correct
import { ActivityIndicator, View } from 'react-native';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreState = async () => {
      try {
        await persistor.flush(); // Attendre que l'état soit restauré
        setIsReady(true);
      } catch (error) {
        console.error('Error restoring persisted state:', error);
      }
    };

    restoreState();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <MainNavigator /> {/* Vérifiez que MainNavigator est bien défini */}
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;