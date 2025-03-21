import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Subscription } from '../../types';
import { apiConfig } from '../../config/api';

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  loading: false,
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetch',
  async (userId: string) => {
    const response = await fetch(`${apiConfig.baseURL}/subs/user/${userId}`);
    const data = await response.json();
    if (!data.result) {
      throw new Error(data.error);
    }
    return data.subs;
  }
);

export const addSubscription = createAsyncThunk(
  'subscriptions/add',
  async (subscription: {
    name: string;
    price: number;
    billingCycle: string;
    nextBillingDate: string;
    userId: string;
  }) => {
    const response = await fetch(`${apiConfig.baseURL}/subs/create`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify(subscription),
    });
    const data = await response.json();
    if (!data.result) {
      throw new Error(data.error);
    }
    return data.sub;
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async ({ subscriptionId, userId }: { subscriptionId: string; userId: string }) => {
    const response = await fetch(`${apiConfig.baseURL}/subs/delete/${subscriptionId}/${userId}`, {
      method: 'DELETE',
      headers: apiConfig.headers,
    });
    const data = await response.json();
    if (!data.result) {
      throw new Error(data.error);
    }
    return subscriptionId;
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Add subscription
      .addCase(addSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions.push(action.payload);
        state.error = null;
      })
      .addCase(addSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.filter(
          (sub) => sub._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer; 