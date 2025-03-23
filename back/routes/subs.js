const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Récupérer tous les abonnements d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Recherche des abonnements pour l\'utilisateur:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ result: false, error: 'Utilisateur non trouvé' });
    }

    console.log('Abonnements trouvés:', user.subscriptions);
    res.json({ result: true, subs: user.subscriptions });
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    res.json({ result: false, error: 'Erreur lors de la récupération des abonnements' });
  }
});

// Créer un nouvel abonnement
router.post('/create', async (req, res) => {
  try {
    const { name, price, billingCycle, nextBillingDate, userId, category } = req.body;
    
    console.log('Tentative de création d\'abonnement:', {
      name,
      price,
      billingCycle,
      nextBillingDate,
      userId,
      category
    });

    if (!name || !price || !billingCycle || !nextBillingDate || !userId) {
      console.error('Données manquantes:', { name, price, billingCycle, nextBillingDate, userId, category });
      return res.json({ result: false, error: 'Toutes les données sont requises' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ result: false, error: 'Utilisateur non trouvé' });
    }

    const newSubscription = {
      name,
      price: Number(price),
      billingCycle,
      nextBillingDate,
      category: category || 'other',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    user.subscriptions.push(newSubscription);
    await user.save();

    console.log('Abonnement sauvegardé avec succès:', newSubscription);
    res.json({ result: true, sub: user.subscriptions[user.subscriptions.length - 1] });
  } catch (error) {
    console.error('Erreur lors de la création de l\'abonnement:', error);
    res.json({ 
      result: false, 
      error: error.message || 'Erreur lors de la création de l\'abonnement'
    });
  }
});

// Supprimer un abonnement
router.delete('/delete/:subscriptionId/:userId', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ result: false, error: 'Utilisateur non trouvé' });
    }

    // Supprimer l'abonnement du tableau
    user.subscriptions = user.subscriptions.filter(sub => sub._id.toString() !== subscriptionId);
    await user.save();

    res.json({ result: true, message: 'Abonnement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'abonnement:', error);
    res.json({ result: false, error: 'Erreur lors de la suppression de l\'abonnement' });
  }
});

// Mettre à jour un abonnement
router.put('/update/:subscriptionId/:userId', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.params;
    const { nextBillingDate } = req.body;
    
    console.log('Tentative de mise à jour:', {
      subscriptionId,
      userId,
      nextBillingDate
    });

    if (!subscriptionId || !userId || !nextBillingDate) {
      console.error('Données manquantes:', { subscriptionId, userId, nextBillingDate });
      return res.json({ result: false, error: 'Données manquantes' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ result: false, error: 'Utilisateur non trouvé' });
    }

    const subscription = user.subscriptions.id(subscriptionId);
    if (!subscription) {
      return res.json({ result: false, error: 'Abonnement non trouvé' });
    }

    subscription.nextBillingDate = nextBillingDate;
    subscription.updatedAt = new Date();
    await user.save();

    console.log('Abonnement mis à jour:', subscription);
    res.json({ result: true, sub: subscription });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    res.json({ result: false, error: 'Erreur lors de la mise à jour de l\'abonnement' });
  }
});

module.exports = router;