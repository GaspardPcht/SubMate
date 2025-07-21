import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../redux/store';
import { RootState } from '../redux/store';
import { Subscription } from '../types';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Configurer le canal de notification Android
const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('subscription-reminders', {
      name: 'Rappels d\'abonnements',
      description: 'Notifications pour les rappels de débit d\'abonnements',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#377AF2',
      sound: 'default',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }
};

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

// Fonction pour planifier une notification locale de secours (fallback)
export const scheduleSubscriptionReminder = async (subscription: Subscription) => {
  try {
    // Calculer la date de la veille du débit
    const billingDate = new Date(subscription.nextBillingDate);
    const reminderDate = new Date(billingDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // Si la date est déjà passée, calculer la prochaine occurrence
    const today = new Date();
    if (reminderDate < today) {
      if (subscription.billingCycle === 'monthly') {
        while (reminderDate < today) {
          reminderDate.setMonth(reminderDate.getMonth() + 1);
        }
      } else if (subscription.billingCycle === 'yearly') {
        while (reminderDate < today) {
          reminderDate.setFullYear(reminderDate.getFullYear() + 1);
        }
      }
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
      console.log('Notification locale déjà planifiée pour cette date');
      return;
    }

    // Configurer la date pour 9h00
    reminderDate.setHours(9, 0, 0, 0);
    
    console.log('Notification locale planifiée pour:', reminderDate);
    
    // Planifier la notification locale comme fallback
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rappel SubMate',
        body: `Votre abonnement ${subscription.name} sera débité demain (${subscription.price}€)`,
        sound: true,
        badge: 1,
        data: { 
          subscriptionId: subscription._id,
          type: 'billing_reminder',
          fallback: true
        },
      },
      trigger: {
        date: reminderDate,
        channelId: 'subscription-reminders'
      } as Notifications.DateTriggerInput,
    });
    
    console.log('Notification locale de secours planifiée');
  } catch (error) {
    console.error('Erreur lors de la planification de la notification locale:', error);
  }
};

// Fonction pour planifier les notifications groupées pour tous les abonnements
export const scheduleAllSubscriptionReminders = async () => {
  try {
    const state = store.getState();
    const subscriptions = (state as RootState).subscriptions.subscriptions;
    
    // Grouper les abonnements par date de débit
    const subscriptionsByDate: { [key: string]: Subscription[] } = {};
    
    subscriptions.forEach(subscription => {
      const billingDate = new Date(subscription.nextBillingDate);
      const reminderDate = new Date(billingDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      
      // Calculer la prochaine date si elle est passée
      const today = new Date();
      if (reminderDate < today) {
        if (subscription.billingCycle === 'monthly') {
          while (reminderDate < today) {
            reminderDate.setMonth(reminderDate.getMonth() + 1);
          }
        } else if (subscription.billingCycle === 'yearly') {
          while (reminderDate < today) {
            reminderDate.setFullYear(reminderDate.getFullYear() + 1);
          }
        }
      }
      
      const dateKey = reminderDate.toDateString();
      if (!subscriptionsByDate[dateKey]) {
        subscriptionsByDate[dateKey] = [];
      }
      subscriptionsByDate[dateKey].push(subscription);
    });

    // Planifier une notification groupée par date
    for (const [dateKey, subs] of Object.entries(subscriptionsByDate)) {
      await scheduleGroupedNotification(subs, new Date(dateKey));
    }
  } catch (error) {
    console.error('Erreur lors de la planification des notifications:', error);
  }
};

// Nouvelle fonction pour planifier une notification groupée
const scheduleGroupedNotification = async (subscriptions: Subscription[], reminderDate: Date) => {
  try {
    // Vérifier si une notification existe déjà pour cette date
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const existingNotification = existingNotifications.find(
      (notification) =>
        notification.trigger && 'date' in notification.trigger &&
        new Date(notification.trigger.date).toDateString() === reminderDate.toDateString()
    );

    if (existingNotification) {
      console.log('Notification groupée déjà planifiée pour cette date');
      return;
    }

    // Configurer la date pour 9h00
    reminderDate.setHours(9, 0, 0, 0);
    
    let title, body;
    
    if (subscriptions.length === 1) {
      // Une seule souscription
      title = 'Rappel SubMate';
      body = `Votre abonnement ${subscriptions[0].name} sera débité demain (${subscriptions[0].price}€)`;
    } else {
      // Plusieurs souscriptions
      title = `${subscriptions.length} abonnements à débiter demain`;
      const totalAmount = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
      const subscriptionNames = subscriptions.map(sub => sub.name).join(', ');
      
      if (subscriptions.length === 2) {
        body = `${subscriptionNames} seront débités demain (${totalAmount}€)`;
      } else if (subscriptions.length <= 4) {
        body = `${subscriptionNames} seront débités demain (${totalAmount}€)`;
      } else {
        body = `${subscriptions.length} abonnements seront débités demain (${totalAmount}€)`;
      }
    }
    
    console.log('Notification locale groupée planifiée pour:', reminderDate);
    
    // Planifier la notification locale groupée
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        badge: subscriptions.length,
        data: { 
          subscriptionIds: subscriptions.map(s => s._id),
          type: 'billing_reminder_group',
          fallback: true,
          count: subscriptions.length
        },
      },
      trigger: {
        date: reminderDate,
        channelId: 'subscription-reminders'
      } as Notifications.DateTriggerInput,
    });
    
    console.log(`Notification locale groupée planifiée pour ${subscriptions.length} abonnement(s)`);
  } catch (error) {
    console.error('Erreur lors de la planification de la notification groupée:', error);
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

// Fonction pour enregistrer les notifications push
export const registerForPushNotifications = async (userId: string) => {
  try {
    // Configurer le canal de notification en premier
    await setupNotificationChannel();

    if (!Device.isDevice) {
      console.log('Les notifications ne sont pas disponibles sur l\'émulateur');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: true,
          allowProvisional: false,
          allowAnnouncements: false,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission refusée pour les notifications');
      return null;
    }

    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId
    });

    console.log('Token push obtenu:', pushToken.data);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('Envoi du push token au serveur...', {
        apiUrl: API_URL,
        hasUserToken: !!userToken,
        pushTokenLength: pushToken.data.length
      });

      const res = await fetch(`${API_URL}/notifications/register-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          pushToken: pushToken.data
        })
      });

      const data = await res.json();
      console.log('Réponse du serveur pour push token:', {
        status: res.status,
        data
      });

      if (res.ok) {
        console.log('✅ Push token enregistré avec succès sur le serveur');
      } else {
        console.error('❌ Échec de l\'enregistrement du push token:', data);
      }
      
      return pushToken.data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du token:', error);
      // Retourner le token même si l'enregistrement serveur échoue
      return pushToken.data;
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement pour les notifications:', error);
    return null;
  }
};

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
