const express = require('express');
const router = express.Router();
const Sub = require('../models/sub');

// Récupérer tous les abonnements d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Recherche des abonnements pour l\'utilisateur:', userId);
    const subscriptions = await Sub.find({ userId });
    console.log('Abonnements trouvés:', subscriptions);
    res.json({ result: true, subs: subscriptions });
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    res.json({ result: false, error: 'Erreur lors de la récupération des abonnements' });
  }
});

// Créer un nouvel abonnement
router.post('/create', async (req, res) => {
  try {
    const { name, price, billingCycle, nextBillingDate, userId } = req.body;
    const subscription = new Sub({
      name,
      price,
      billingCycle,
      nextBillingDate,
      userId
    });
    const savedSubscription = await subscription.save();
    res.json({ result: true, sub: savedSubscription });
  } catch (error) {
    res.json({ result: false, error: 'Erreur lors de la création de l\'abonnement' });
  }
});

// Supprimer un abonnement
router.delete('/delete/:subscriptionId/:userId', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.params;
    const subscription = await Sub.findOneAndDelete({ _id: subscriptionId, userId });
    if (!subscription) {
      return res.json({ result: false, error: 'Abonnement non trouvé' });
    }
    res.json({ result: true, message: 'Abonnement supprimé avec succès' });
  } catch (error) {
    res.json({ result: false, error: 'Erreur lors de la suppression de l\'abonnement' });
  }
});

module.exports = router;