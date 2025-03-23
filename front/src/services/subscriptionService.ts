import { api } from './api';
import { Subscription } from '../types';

export const getSubscriptions = async (userId: string) => {
  try {
    const response = await api.get(`/subs/user/${userId}`);
    return response.data.subs;
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    throw error;
  }
};

export const addSubscription = async (userId: string, subscription: Omit<Subscription, '_id'>) => {
  try {
    const response = await api.post(`/subs/create`, { ...subscription, userId });
    return response.data.sub;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'abonnement:', error);
    throw error;
  }
};

export const updateSubscription = async (userId: string, subscriptionId: string, subscription: Partial<Subscription>) => {
  try {
    console.log('Making PUT request to update subscription:', {
      url: `/subs/update/${subscriptionId}/${userId}`,
      data: subscription
    });
    
    const response = await api.put(`/subs/update/${subscriptionId}/${userId}`, subscription);
    console.log('Update subscription response:', response.data);
    return response.data.sub;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    throw error;
  }
};

export const deleteSubscription = async (userId: string, subscriptionId: string) => {
  try {
    const response = await api.delete(`/subs/delete/${subscriptionId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'abonnement:', error);
    throw error;
  }
}; 