import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigation/MainTabNavigator'; // Vérifiez que ce chemin est correct
import { ActivityIndicator, View, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreState = async () => {
      try {
        await persistor.flush(); 
        setIsReady(true);
      } catch (error) {
        console.error('Error restoring persisted state:', error);
      }
    };

    restoreState();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={styles.container}>
          <NavigationContainer>
            <MainNavigator /> {/* Vérifiez que MainNavigator est bien défini */}
          </NavigationContainer>
        </View>
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