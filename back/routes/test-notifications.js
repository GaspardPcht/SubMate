const express = require('express');
const router = express.Router();
const { checkUpcomingSubscriptions, sendPushNotification } = require('../services/notificationService');
const User = require('../models/user');

// Route pour tester les notifications
router.post('/check-subscriptions', async (req, res) => {
  try {
    await checkUpcomingSubscriptions();
    res.json({ success: true, message: 'Vérification des abonnements effectuée' });
  } catch (error) {
    console.error('Erreur lors du test des notifications:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du test des notifications' });
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
