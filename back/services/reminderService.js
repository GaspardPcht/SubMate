const { sendPushNotification } = require('../utils/notifications');
const User = require('../models/user');

const sendDailyReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Get all subscriptions that will be billed tomorrow
    const users = await User.find({
      'subscriptions.nextBillingDate': {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 86400000) // +24 hours
      }
    });

    const notificationPromises = users.flatMap(user => {
      if (!user.pushToken) return [];
      
      return user.subscriptions
        .filter(subscription => {
          const nextBilling = new Date(subscription.nextBillingDate);
          return nextBilling >= tomorrow && nextBilling < new Date(tomorrow.getTime() + 86400000);
        })
        .map(subscription => {
        return sendPushNotification(
          user.pushToken,
          'Rappel de débit',
          `Votre abonnement ${subscription.name} sera débité demain pour ${subscription.price}€`,
          { subscriptionId: subscription._id }
        );
        });
    });

    await Promise.all(notificationPromises.filter(Boolean));
    console.log(`Sent ${notificationPromises.length} reminders`);
  } catch (error) {
    console.error('Error sending daily reminders:', error);
    throw error;
  }
};

module.exports = { sendDailyReminders };
