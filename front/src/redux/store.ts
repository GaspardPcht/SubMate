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
  whitelist: ['auth'], // Assurez-vous que 'auth' est bien dans la whitelist
  blacklist: ['_persist'],
  timeout: 0,
  debug: true, // Activez les logs pour vérifier le comportement de redux-persist
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

export const persistor = persistStore(store, null, () => {
  console.log('Redux Persistor initialized and state restored'); // Log pour vérifier la restauration
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;