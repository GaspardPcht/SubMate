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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Trouver tous les utilisateurs avec des abonnements qui seront débités demain
    const users = await User.find({
      'subscriptions.nextBillingDate': {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      'pushToken': { $exists: true, $ne: null }
    });

    for (const user of users) {
      const subscriptionsDue = user.subscriptions.filter(sub => {
        const subDate = new Date(sub.nextBillingDate);
        return subDate >= tomorrow && subDate < dayAfterTomorrow;
      });

      if (subscriptionsDue.length > 0 && user.pushToken) {
        for (const sub of subscriptionsDue) {
          await sendPushNotification(
            user.pushToken,
            'Rappel de débit à venir',
            `Votre abonnement "${sub.name}" sera débité demain pour un montant de ${sub.price}€`
          );
        }
      }
    }

    console.log('Vérification des abonnements terminée');
  } catch (error) {
    console.error('Erreur lors de la vérification des abonnements:', error);
  }
};

module.exports = {
  sendPushNotification,
  checkUpcomingSubscriptions
};
