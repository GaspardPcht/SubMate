import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Subscription } from '../../types/subscription';
import { BillingCycle } from '../../types/subscription';
import { api } from '../../services/api';
import { updateSubscription as updateSubscriptionService } from '../../services/subscriptionService';
import { Toast, ALERT_TYPE } from 'react-native-alert-notification';
import { CategoryKey } from '../../constants/categories';

// Fonction utilitaire pour calculer la prochaine date de renouvellement
const calculateNextBillingDate = (currentDate: string, billingCycle: BillingCycle): string => {
  const date = new Date(currentDate);
  const today = new Date();

  // Si la date est passée, calculer la prochaine date
  if (date < today) {
    if (billingCycle === 'monthly') {
      // Ajouter des mois jusqu'à ce que la date soit dans le futur
      while (date < today) {
        date.setMonth(date.getMonth() + 1);
      }
    } else {
      // Ajouter des années jusqu'à ce que la date soit dans le futur
      while (date < today) {
        date.setFullYear(date.getFullYear() + 1);
      }
    }
  }
  
  return date.toISOString();
};

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
}

interface AddSubscriptionPayload {
  name: string;
  price: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  userId: string;
  category: CategoryKey;
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
      const response = await api.get(`/subs/user/${userId}`);
      
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
  'subscriptions/addSubscription',
  async (subscription: AddSubscriptionPayload) => {
    try {
      const response = await api.post('/subs/create', subscription);
      
      if (!response.data || !response.data.result) {
        throw new Error('Format de réponse invalide');
      }

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Abonnement ajouté avec succès'
      });

      return response.data.sub;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'abonnement:', error);
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
  async ({ subscriptionId, userId }: { subscriptionId: string; userId: string }, { dispatch }) => {
    try {
      const response = await api.delete(`/subs/delete/${subscriptionId}/${userId}`);
      
      if (!response.data || !response.data.result) {
        throw new Error('Format de réponse invalide');
      }

      // Rafraîchir la liste des abonnements après la suppression
      await dispatch(fetchSubscriptions(userId));
      
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

export const updateSubscriptionDate = createAsyncThunk(
  'subscriptions/updateDate',
  async ({ subscriptionId, userId, subscription }: { 
    subscriptionId: string; 
    userId: string;
    subscription: Subscription;
  }) => {
    try {
      const nextBillingDate = calculateNextBillingDate(
        subscription.nextBillingDate,
        subscription.billingCycle
      );

      const updateResponse = await api.put(`/subs/update/${subscriptionId}/${userId}`, {
        nextBillingDate
      });

      if (!updateResponse.data || !updateResponse.data.result) {
        throw new Error('Format de réponse invalide');
      }

      return updateResponse.data.sub;
    } catch (error: any) {
      console.error('Erreur de mise à jour:', error);
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour de la date';
      throw new Error(message);
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/update',
  async ({ userId, subscription }: { 
    userId: string;
    subscription: Subscription;
  }) => {
    try {
      console.log('=== Début de la mise à jour frontend ===');
      console.log('Données envoyées:', {
        userId,
        subscriptionId: subscription._id,
        subscription
      });

      const updatedSubscription = await updateSubscriptionService(
        subscription._id,
        userId,
        subscription
      );
      
      console.log('Réponse du serveur:', updatedSubscription);
      
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Succès',
        textBody: 'Abonnement mis à jour avec succès'
      });

      console.log('=== Fin de la mise à jour frontend ===');
      return updatedSubscription;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Erreur',
        textBody: error.message || 'Erreur lors de la mise à jour de l\'abonnement'
      });
      throw error;
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
    updateLocalDates: (state) => {
      state.subscriptions = state.subscriptions.map(sub => ({
        ...sub,
        nextBillingDate: calculateNextBillingDate(sub.nextBillingDate, sub.billingCycle)
      }));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        // Éviter les doublons en utilisant un Map
        const uniqueSubscriptions = new Map(
          action.payload.map((sub: Subscription) => [sub._id, sub])
        );
        state.subscriptions = Array.from(uniqueSubscriptions.values()) as Subscription[];
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      })
      .addCase(addSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubscription.fulfilled, (state, action) => {
        state.loading = false;
        // Vérifier si l'abonnement existe déjà
        const exists = state.subscriptions.some(sub => sub._id === action.payload._id);
        if (!exists) {
          state.subscriptions.push(action.payload);
        }
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
      })
      .addCase(updateSubscriptionDate.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
      });
  },
});

export const { clearError, updateLocalDates } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer; 