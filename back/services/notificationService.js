const User = require('../models/user');
const axios = require('axios');

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

const sendPushNotification = async (expoPushToken, title, body) => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: { type: 'subscription_reminder' },
    };

    await axios.post(EXPO_PUSH_ENDPOINT, message, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('Notification envoyée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return false;
  }
};

const checkUpcomingSubscriptions = async () => {
  try {
    // Date de demain à 9h
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    console.log(`Vérification des abonnements pour la période: ${tomorrow.toISOString()} - ${dayAfterTomorrow.toISOString()}`);

    // Trouver tous les utilisateurs avec des abonnements qui seront débités demain
    const users = await User.find({
      'subscriptions.nextBillingDate': {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      'pushToken': { $exists: true, $ne: null }
    });

    console.log(`${users.length} utilisateurs trouvés avec des abonnements à venir`);

    for (const user of users) {
      const subscriptionsDue = user.subscriptions.filter(sub => {
        const subDate = new Date(sub.nextBillingDate);
        return subDate >= tomorrow && subDate < dayAfterTomorrow;
      });

      console.log(`Utilisateur ${user._id}: ${subscriptionsDue.length} abonnements à notifier`);

      if (subscriptionsDue.length > 0 && user.pushToken) {
        // Grouper les notifications par date exacte de débit
        const subscriptionsByDate = {};
        
        subscriptionsDue.forEach(sub => {
          const dateKey = new Date(sub.nextBillingDate).toDateString();
          if (!subscriptionsByDate[dateKey]) {
            subscriptionsByDate[dateKey] = [];
          }
          subscriptionsByDate[dateKey].push(sub);
        });

        // Envoyer une notification groupée par date
        for (const [dateKey, subs] of Object.entries(subscriptionsByDate)) {
          let title, body;
          
          if (subs.length === 1) {
            // Une seule souscription
            title = 'Rappel de débit SubMate';
            body = `Votre abonnement "${subs[0].name}" sera débité demain pour ${subs[0].price}€`;
          } else {
            // Plusieurs souscriptions
            title = `${subs.length} abonnements à débiter demain`;
            const totalAmount = subs.reduce((sum, sub) => sum + sub.price, 0);
            const subscriptionNames = subs.map(sub => sub.name).join(', ');
            
            if (subs.length === 2) {
              body = `${subscriptionNames} seront débités demain pour un total de ${totalAmount}€`;
            } else if (subs.length <= 4) {
              body = `${subscriptionNames} seront débités demain pour un total de ${totalAmount}€`;
            } else {
              body = `${subs.length} abonnements seront débités demain pour un total de ${totalAmount}€`;
            }
          }

          const success = await sendPushNotification(user.pushToken, title, body);
          
          if (success) {
            console.log(`Notification groupée envoyée pour ${subs.length} abonnement(s) à l'utilisateur ${user._id}`);
          } else {
            console.log(`Échec de l'envoi de la notification groupée à l'utilisateur ${user._id}`);
          }
        }
      }
    }

    console.log('Vérification des abonnements terminée');
  } catch (error) {
    console.error('Erreur lors de la vérification des abonnements:', error);
  }
};

// Nouvelle fonction pour envoyer les notifications à 9h précises
const checkAndSendDailyNotifications = async () => {
  const now = new Date();
  // Ne lancer que si on est à 9h (±5 minutes pour la tolérance)
  if (now.getHours() === 9 && now.getMinutes() < 5) {
    console.log('Envoi des notifications quotidiennes à 9h');
    await checkUpcomingSubscriptions();
  }
};

module.exports = {
  sendPushNotification,
  checkUpcomingSubscriptions,
  checkAndSendDailyNotifications
};
