import React, { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { scheduleAllSubscriptionReminders, testNotification } from '../services/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

interface NotificationProviderProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ isAuthenticated, children }) => {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);


  const registerForPushNotificationsAsync = async () => {
    try {
      console.log('=== Début de l\'enregistrement des notifications push ===');
      
      if (!Device.isDevice) {
        console.log('❌ Non disponible sur émulateur');
        Alert.alert('Erreur', 'Les notifications ne sont pas disponibles sur l\'émulateur');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log('📱 Vérification du projet ID:', projectId);
      
      if (!projectId) {
        console.log('❌ Pas de project ID configuré dans app.json');
        return null;
      }

      if (Platform.OS === 'android') {
        console.log('Configuration des canaux Android...');
        // Canal par défaut
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Canal pour les rappels d'abonnements
        await Notifications.setNotificationChannelAsync('subscription-reminders', {
          name: 'Rappels d\'abonnements',
          description: 'Notifications pour les rappels de débit d\'abonnements',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      // Toujours demander la permission, même si elle a déjà été accordée ou refusée
      console.log('🔔 Demande des permissions de notification...');
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('📋 Status des permissions de notification:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Notifications Désactivées',
          'Pour recevoir les rappels de vos abonnements, veuillez activer les notifications dans les paramètres de votre téléphone.',
          [
            { text: 'Plus tard' },
            { 
              text: 'Ouvrir les paramètres',
              onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()
            }
          ]
        );
        return;
      }

      console.log('🔑 Demande du token Expo...');
      let expoPushToken;
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: projectId
        });
        expoPushToken = tokenData;
        console.log('✅ Token Expo obtenu avec succès:', tokenData.data);
      } catch (error) {
        console.error('Erreur lors de l\'obtention du token Expo:', error);
        return;
      }
      
      // Récupérer le token d'authentification
      const authToken = await AsyncStorage.getItem('userToken');
      if (!authToken) {
        console.log('Utilisateur non connecté, impossible de sauvegarder le token de notification');
        return;
      }

      // Mettre à jour le token dans le backend
      try {
        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/users/update-push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ pushToken: expoPushToken.data })
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du token');
        }
        
        const result = await response.json();
        console.log('Token de notification sauvegardé avec succès:', result.token);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du token:', error);
      }

      // Test immédiat des notifications
      await testNotification();
      return expoPushToken.data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des notifications:', error);
    }
  };

  useEffect(() => {
    const setupNotificationListeners = () => {
      // Écouter les notifications reçues
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification reçue:', notification);
        // Mettre à jour le badge si nécessaire
        const badgeCount = notification.request.content.badge || 0;
        if (typeof badgeCount === 'number') {
          Notifications.setBadgeCountAsync(badgeCount);
        }
      });

      // Écouter les réponses aux notifications
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Réponse à la notification:', response);
        const { subscriptionId } = response.notification.request.content.data || {};
        if (subscriptionId) {
          // TODO: Implémenter la navigation vers les détails de l'abonnement
          // Vous devrez passer la référence de navigation via les props ou un contexte
          console.log('Navigation vers l\'abonnement:', subscriptionId);
        }
      });
    };

    const cleanupListeners = () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };

    if (!isAuthenticated) {
      console.log('Utilisateur non authentifié, pas de demande de permissions');
      cleanupListeners();
      return;
    }

    console.log('NotificationProvider monté et utilisateur authentifié, demande des permissions...');
    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        console.log('Setup des notifications terminé, token:', token);
        if (token) {
          setupNotificationListeners();
          // Planifier les notifications pour tous les abonnements
          await scheduleAllSubscriptionReminders();
        }
      } catch (error) {
        console.error('Erreur lors du setup des notifications:', error);
      }
    };
    
    setupNotifications();

    return cleanupListeners;
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default NotificationProvider;
