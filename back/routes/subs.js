const express = require('express');
const router = express.Router();
const Sub = require('../models/sub');
const User = require('../models/user');

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
    
    console.log('Tentative de création d\'abonnement:', {
      name,
      price,
      billingCycle,
      nextBillingDate,
      userId
    });

    if (!name || !price || !billingCycle || !nextBillingDate || !userId) {
      console.error('Données manquantes:', { name, price, billingCycle, nextBillingDate, userId });
      return res.json({ result: false, error: 'Toutes les données sont requises' });
    }

    const subscription = new Sub({
      name,
      price: Number(price),
      billingCycle,
      nextBillingDate,
      userId
    });

    console.log('Nouvel abonnement à sauvegarder:', subscription);

    const savedSubscription = await subscription.save();
    console.log('Abonnement sauvegardé avec succès:', savedSubscription);

    // Mettre à jour le tableau subscriptions de l'utilisateur
    await User.findByIdAndUpdate(
      userId,
      { $push: { subscriptions: savedSubscription._id } }
    );

    res.json({ result: true, sub: savedSubscription });
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
    
    // Supprimer l'abonnement
    const subscription = await Sub.findOneAndDelete({ _id: subscriptionId, userId });
    if (!subscription) {
      return res.json({ result: false, error: 'Abonnement non trouvé' });
    }

    // Mettre à jour le tableau subscriptions de l'utilisateur
    await User.findByIdAndUpdate(
      userId,
      { $pull: { subscriptions: subscriptionId } }
    );

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

    const subscription = await Sub.findOne({ _id: subscriptionId, userId });
    console.log('Abonnement trouvé:', subscription);

    if (!subscription) {
      console.error('Abonnement non trouvé');
      return res.json({ result: false, error: 'Abonnement non trouvé' });
    }

    subscription.nextBillingDate = nextBillingDate;
    const updatedSubscription = await subscription.save();
    console.log('Abonnement mis à jour:', updatedSubscription);

    // Vérifier que l'abonnement est bien dans le tableau subscriptions de l'utilisateur
    const user = await User.findById(userId);
    if (!user.subscriptions.includes(subscriptionId)) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { subscriptions: subscriptionId } }
      );
    }

    res.json({ result: true, sub: updatedSubscription });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    res.json({ result: false, error: 'Erreur lors de la mise à jour de l\'abonnement' });
  }
});

module.exports = router;