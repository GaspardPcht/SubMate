import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types';
import { apiConfig } from '../../config/api';

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
    const response = await fetch(`${apiConfig.baseURL}/users/login`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!data.result) {
      throw new Error(data.error);
    }
    return data.user;
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ firstname, lastname, email, password }: { firstname: string; lastname: string; email: string; password: string }) => {
    const response = await fetch(`${apiConfig.baseURL}/users/signup`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify({ firstname, lastname, email, password }),
    });
    const data = await response.json();
    if (!data.result) {
      throw new Error(data.error);
    }
    return data.user;
  }
);

export const updateUser = createAsyncThunk(
  'auth/update',
  async ({ userId, firstname, lastname, email, password }: { userId: string; firstname: string; lastname: string; email: string; password?: string }) => {
    const response = await fetch(`${apiConfig.baseURL}/users/update/${userId}`, {
      method: 'PUT',
      headers: apiConfig.headers,
      body: JSON.stringify({ firstname, lastname, email, ...(password && { password }) }),
    });
    const data = await response.json();
    if (!data.result) {
      throw new Error(data.error);
    }
    return data.user;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
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
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
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