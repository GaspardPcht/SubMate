const express = require('express');
const router = express.Router();
const { checkUpcomingSubscriptions, sendPushNotification } = require('../services/notificationService');
const User = require('../models/user');

// Route pour tester les notifications groupées
router.post('/check-subscriptions', async (req, res) => {
  try {
    console.log('Test des notifications groupées...');
    await checkUpcomingSubscriptions();
    res.json({ success: true, message: 'Vérification des abonnements groupés effectuée' });
  } catch (error) {
    console.error('Erreur lors du test des notifications:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du test des notifications' });
  }
});

// Route pour vérifier les abonnements dus demain
router.get('/upcoming', async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const users = await User.find({
      'subscriptions.nextBillingDate': {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    });

    const upcomingSubscriptions = [];
    
    users.forEach(user => {
      const subscriptionsDue = user.subscriptions.filter(sub => {
        const subDate = new Date(sub.nextBillingDate);
        return subDate >= tomorrow && subDate < dayAfterTomorrow;
      });
      
      if (subscriptionsDue.length > 0) {
        upcomingSubscriptions.push({
          userId: user._id,
          userEmail: user.email,
          hasPushToken: !!user.pushToken,
          subscriptions: subscriptionsDue.map(sub => ({
            name: sub.name,
            price: sub.price,
            nextBillingDate: sub.nextBillingDate
          }))
        });
      }
    });

    res.json({
      success: true,
      tomorrow: tomorrow.toISOString(),
      upcomingSubscriptions,
      totalUsers: upcomingSubscriptions.length,
      totalSubscriptions: upcomingSubscriptions.reduce((sum, user) => sum + user.subscriptions.length, 0)
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la vérification',
      details: error.message 
    });
  }
});

// Route pour envoyer une notification de test directement
router.post('/send-test-notification', async (req, res) => {
  try {
    // Token de test par défaut si aucun n'est fourni
    const testToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
    const token = req.body.token || testToken;
    
    console.log('Envoi de notification de test à:', token);
    
    await sendPushNotification(
      token,
      'Test de Notification',
      'Ceci est une notification de test de SubMate!'
    );

    res.json({ 
      success: true, 
      message: 'Notification de test envoyée', 
      userToken: token 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification de test:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi de la notification de test' 
    });
  }
});

module.exports = router;
