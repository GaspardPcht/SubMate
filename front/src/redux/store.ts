import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import subscriptionsReducer from './slices/subscriptionsSlice';
import userPreferencesReducer from './slices/userPreferencesSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Suppression de la whitelist pour persister tous les reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  subscriptions: subscriptionsReducer,
  userPreferences: userPreferencesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 