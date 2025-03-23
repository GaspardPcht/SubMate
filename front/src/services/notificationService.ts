import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { store } from '../redux/store';
import { RootState } from '../redux/store';
import { Subscription } from '../types';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Fonction pour charger l'icône de notification
const loadNotificationIcon = async () => {
  try {
    const asset = Asset.fromModule(require('../../assets/Logo/SubMate_logo.png'));
    await asset.downloadAsync();
    return asset.localUri;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'icône:', error);
    return null;
  }
};

// Fonction pour planifier une notification
export const scheduleSubscriptionReminder = async (subscription: Subscription) => {
  try {
    const iconUri = await loadNotificationIcon();
    
    // Calculer la date de la veille du débit
    const billingDate = new Date(subscription.nextBillingDate);
    const reminderDate = new Date(billingDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // Si la date est déjà passée, planifier pour le mois prochain
    if (reminderDate < new Date()) {
      reminderDate.setMonth(reminderDate.getMonth() + 1);
    }

    // Vérifier si une notification existe déjà pour cette date
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const existingNotification = existingNotifications.find(
      (notification) =>
        notification.content.data?.subscriptionId === subscription._id &&
        notification.trigger && 'date' in notification.trigger &&
        new Date(notification.trigger.date).toDateString() === reminderDate.toDateString()
    );

    if (existingNotification) {
      console.log('Notification déjà planifiée pour cette date');
      return;
    }

    // Planifier la notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rappel de débit',
        body: `Votre abonnement ${subscription.name} se débitera demain pour un prix de ${subscription.price}€`,
        sound: true,
        data: { subscriptionId: subscription._id },
      },
      trigger: {
        date: reminderDate,
        hour: 9,
        minute: 0,
        repeats: true,
        repeatsInterval: 'month',
      } as unknown as Notifications.NotificationTriggerInput,
    });

    console.log('Notification planifiée pour:', reminderDate);
  } catch (error) {
    console.error('Erreur lors de la planification de la notification:', error);
  }
};

// Fonction pour planifier les notifications pour toutes les abonnements actifs
export const scheduleAllSubscriptionReminders = async () => {
  try {
    const state = store.getState();
    const subscriptions = (state as RootState).subscriptions.subscriptions;
    // On considère tous les abonnements comme actifs car ils n'ont pas de statut
    for (const subscription of subscriptions) {
      await scheduleSubscriptionReminder(subscription);
    }
  } catch (error) {
    console.error('Erreur lors de la planification des notifications:', error);
  }
};

// Fonction pour annuler toutes les notifications planifiées
export const cancelAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Toutes les notifications ont été annulées');
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
  }
};

// Fonction pour tester les notifications
export const testNotification = async () => {
  try {
    const iconUri = await loadNotificationIcon();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test de notification',
        body: 'Ceci est une notification de test',
        sound: true,
      },
      trigger: {
        seconds: 60,
      } as unknown as Notifications.NotificationTriggerInput,
    });
    console.log('Notification de test planifiée');
  } catch (error) {
    console.error('Erreur lors du test de notification:', error);
  }
}; 