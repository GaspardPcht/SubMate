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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission non accordée pour les notifications');
      return null;
    }

    // Obtenir le token sans projectId
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: undefined // Utiliser undefined pour éviter l'erreur
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return token.data;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des notifications:', error);
    return null;
  }
};

export const scheduleSubscriptionReminder = async (subscription: Subscription, reminderDays: number) => {
  try {
    const nextBillingDate = new Date(subscription.nextBillingDate);
    const reminderDate = new Date(nextBillingDate);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);

    if (reminderDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rappel de paiement',
          body: `Le paiement de ${subscription.name} (${subscription.price}€) est prévu dans ${reminderDays} jour(s)`,
        },
        trigger: {
          date: reminderDate,
        },
      });
    }
  } catch (error) {
    console.error('Erreur lors de la programmation du rappel:', error);
    throw error;
  }
};

export const scheduleAllSubscriptionReminders = async (subscriptions: Subscription[], reminderDays: number) => {
  try {
    await cancelAllScheduledNotificationsAsync();
    
    for (const subscription of subscriptions) {
      await scheduleSubscriptionReminder(subscription, reminderDays);
    }
  } catch (error) {
    console.error('Erreur lors de la programmation des rappels:', error);
    throw error;
  }
};

export const cancelAllScheduledNotificationsAsync = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erreur lors de l\'annulation des notifications:', error);
    throw error;
  }
};

export const cancelSubscriptionReminder = async (subscriptionId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(`subscription-${subscriptionId}`);
  } catch (error) {
    console.error('Erreur lors de l\'annulation du rappel:', error);
    throw error;
  }
}; 