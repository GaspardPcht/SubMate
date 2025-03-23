import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Subscription } from '../types';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async () => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission refusée pour les notifications');
      return null;
    }

    // On retourne un token factice pour permettre l'activation des notifications
    return 'local-notification-token';
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des notifications:', error);
    return null;
  }
};

export const scheduleAllSubscriptionReminders = async (subscriptions: Subscription[], daysBefore: number) => {
  try {
    // Annuler toutes les notifications existantes
    await cancelAllScheduledNotificationsAsync();

    // Programmer de nouvelles notifications pour chaque abonnement
    for (const subscription of subscriptions) {
      // Utiliser la date de renouvellement stockée dans l'abonnement
      const nextBillingDate = new Date(subscription.nextBillingDate);
      
      // Ajuster la date pour le rappel
      const reminderDate = new Date(nextBillingDate);
      reminderDate.setDate(reminderDate.getDate() - daysBefore);

      // Ne programmer que si la date de rappel est dans le futur
      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Rappel de renouvellement',
            body: `Votre abonnement ${subscription.name} sera renouvelé dans ${daysBefore} jour${daysBefore > 1 ? 's' : ''}`,
            sound: true,
          },
          trigger: {
            date: reminderDate,
            channelId: 'default',
          },
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la programmation des rappels:', error);
  }
};

export const cancelAllScheduledNotificationsAsync = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
  }
}; 