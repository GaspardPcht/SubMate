import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const onBeforeLift = () => {
  };

  return (
    <StoreProvider store={store}>
      <PersistGate 
        loading={null} 
        persistor={persistor}
        onBeforeLift={onBeforeLift}
      >
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </StoreProvider>
  );
} 