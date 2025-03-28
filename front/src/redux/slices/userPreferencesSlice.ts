import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferencesState } from '../../types';

const initialState: UserPreferencesState = {
  notificationsEnabled: true, // Activé par défaut pour les nouveaux utilisateurs
  reminderDays: 1, // Nombre de jours avant le rappel
  loading: false,
  error: null,
};

export const loadUserPreferences = createAsyncThunk(
  'userPreferences/loadPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const preferences = await AsyncStorage.getItem('userPreferences');
      return preferences ? JSON.parse(preferences) : initialState;
    } catch (error) {
      return rejectWithValue('Erreur lors du chargement des préférences');
    }
  }
);

export const saveUserPreferences = createAsyncThunk(
  'userPreferences/savePreferences',
  async (preferences: Partial<UserPreferencesState>, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      return preferences;
    } catch (error) {
      return rejectWithValue('Erreur lors de la sauvegarde des préférences');
    }
  }
);

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
      AsyncStorage.setItem('userPreferences', JSON.stringify({
        ...state,
        notificationsEnabled: state.notificationsEnabled
      })).catch(() => {});
    },
    setReminderDays: (state, action: PayloadAction<number>) => {
      state.reminderDays = action.payload;
    },
    setUserPreferences: (state, action: PayloadAction<Partial<UserPreferencesState>>) => {
      Object.assign(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(loadUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(saveUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  toggleNotifications,
  setReminderDays,
  setUserPreferences,
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer; 