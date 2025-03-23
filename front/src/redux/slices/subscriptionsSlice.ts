import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Subscription } from '../../types';
import { api } from '../../services/api';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';

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
  'subscriptions/fetchSubscriptions',
  async (userId: string) => {
    try {
      console.log('Fetching subscriptions for user:', userId);
      const response = await api.get(`/subs/user/${userId}`);
      console.log('Subscriptions response:', response.data);
      
      if (!response.data || !response.data.result) {
        throw new Error('Format de réponse invalide');
      }
      
      return response.data.subs;
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      const message = error.response?.data?.message || 'Erreur lors du chargement des abonnements';
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: message
      });
      throw new Error(message);
    }
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
    try {
      console.log('Adding subscription:', subscription);
      const response = await api.post('/subs/create', subscription);
      console.log('Add subscription response:', response.data);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Abonnement ajouté avec succès'
      });
      return response.data.sub;
    } catch (error: any) {
      console.error('Error adding subscription:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'ajout de l\'abonnement';
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: message
      });
      throw new Error(message);
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async ({ subscriptionId, userId }: { subscriptionId: string; userId: string }) => {
    try {
      await api.delete(`/subs/delete/${subscriptionId}/${userId}`);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Abonnement supprimé avec succès'
      });
      return subscriptionId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la suppression de l\'abonnement';
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: message
      });
      throw new Error(message);
    }
  }
);

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        console.log('Chargement des abonnements en cours...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        console.log('Abonnements reçus dans le reducer:', action.payload);
        state.loading = false;
        state.subscriptions = action.payload || [];
        state.error = null;
        console.log('Nouvel état des abonnements dans le store:', state.subscriptions);
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        console.log('Erreur lors du chargement des abonnements:', action.error);
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
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

export const { clearError } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer; 