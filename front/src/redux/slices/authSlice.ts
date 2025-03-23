import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';
import { api } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data.result) {
      await AsyncStorage.setItem('token', response.data.token);
      return response.data.user;
    }
    throw new Error(response.data.error || 'Une erreur est survenue');
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ firstname, lastname, email, password }: { firstname: string; lastname: string; email: string; password: string }) => {
    const response = await api.post('/users/signup', { firstname, lastname, email, password });
    if (response.data.result) {
      await AsyncStorage.setItem('token', response.data.token);
      return response.data.user;
    }
    throw new Error(response.data.error || 'Une erreur est survenue');
  }
);

export const updateUser = createAsyncThunk(
  'auth/update',
  async ({ userId, firstname, lastname, email, password }: { userId: string; firstname: string; lastname: string; email: string; password?: string }) => {
    const response = await api.put(`/users/update/${userId}`, { firstname, lastname, email, ...(password && { password }) });
    if (response.data.result) {
      return response.data.user;
    }
    throw new Error(response.data.error || 'Une erreur est survenue');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      AsyncStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 