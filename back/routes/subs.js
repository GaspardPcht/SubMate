const express = require('express');
const router = express.Router();
const Sub = require('../models/sub');
const User = require('../models/user');

// Récupérer tous les abonnements d'un utilisateur
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  User.findById(userId)
    .populate('subscriptions')
    .then(user => {
      if (!user) {
        return res.json({result: false, error: 'Utilisateur non trouvé'});
      }
      res.json({result: true, subs: user.subscriptions});
    });
}); 

// Créer un nouvel abonnement
router.post('/create', (req, res) => {
  const { name, price, billingCycle, userId } = req.body;
  
  if (!name || !price || !billingCycle || !userId) {
    return res.json({result: false, error: 'Tous les champs sont requis'});
  }

  User.findById(userId)
    .populate('subscriptions')
    .then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Utilisateur non trouvé' });
      }

      // Vérifier si l'abonnement existe déjà pour cet utilisateur
      const existingSub = user.subscriptions.find(sub => sub.name.toLowerCase() === name.toLowerCase());
      if (existingSub) {
        return res.json({ result: false, error: 'Un abonnement avec ce nom existe déjà' });
      }
      
      // Créer le nouvel abonnement
      const subscription = new Sub({ 
        name, 
        price, 
        billingCycle,
      });
      
      // Sauvegarder l'abonnement et l'ajouter à l'utilisateur
      subscription.save().then(newSub => {
        user.subscriptions.push(newSub._id);
        user.save().then(() => {
          res.json({result: true, sub: newSub});
        });
      });
    });
}); 

// Supprimer un abonnement
router.delete('/delete/:id/:userId', (req, res) => {
  const { id } = req.params;
  const { userId } = req.params;

  if (!id || !userId) {
    return res.json({result: false, error: 'L\'ID de l\'abonnement et de l\'utilisateur sont requis'});
  } 

  User.findById(userId).then(user => {
    if (!user) {
      return res.json({result: false, error: 'Utilisateur non trouvé'});
    }

    // Vérifier si l'abonnement appartient à l'utilisateur
    const subIndex = user.subscriptions.indexOf(id);
    if (subIndex === -1) {
      return res.json({result: false, error: 'Abonnement non trouvé ou non autorisé'});
    }

    // Supprimer l'abonnement et le retirer de la liste de l'utilisateur
    Sub.findByIdAndDelete(id).then(sub => {
      if (!sub) {
        return res.json({result: false, error: 'Abonnement non trouvé'});
      }
      user.subscriptions.splice(subIndex, 1);
      user.save().then(() => {
        res.json({result: true, sub});
      });
    });
  });
});

// Mettre à jour un abonnement
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, billingCycle, userId } = req.body;

  if (!id || !userId) {
    return res.json({result: false, error: 'L\'ID de l\'abonnement et de l\'utilisateur sont requis'});
  }

  User.findById(userId)
    .populate('subscriptions')
    .then(user => {
      if (!user) {
        return res.json({result: false, error: 'Utilisateur non trouvé'});
      }

      // Vérifier si le nouveau nom n'existe pas déjà
      const existingSub = user.subscriptions.find(sub => 
        sub.name.toLowerCase() === name.toLowerCase() && sub._id.toString() !== id
      );
      if (existingSub) {
        return res.json({result: false, error: 'Un abonnement avec ce nom existe déjà'});
      }

      Sub.findByIdAndUpdate(
        id,
        { name, price, billingCycle },
        { new: true }
      ).then(sub => {
        if (!sub) {
          return res.json({result: false, error: 'Abonnement non trouvé'});
        }
        res.json({result: true, sub});
      });
    });
});

module.exports = router;