const express = require('express');
const router = express.Router();
const Sub = require('../models/sub');

router.get('/', (req, res) => {
  Sub.find({ userId: req.user._id }).then(subs => res.json({result: true, subs}));
}); 

router.post('/create', (req, res) => {
  const { name, price, billingCycle } = req.body;
  if (!name || !price || !billingCycle) {
    return res.json({result: false, error: 'Tous les champs sont requis'});
  }

  Sub.findOne({ name, userId: req.user._id }).then(existingSub => {
    if (existingSub) {
      return res.json({ result: false, error: 'Un abonnement avec ce nom existe déjà' });
    }
    
    const subscription = new Sub({ 
      name, 
      price, 
      billingCycle,
      userId: req.user._id 
    });
    subscription.save().then(newSub => res.json({result: true, sub: newSub}));
  });
}); 

router.delete('/delete/:id', (req, res) => {
  if (!req.params.id) {
    return res.json({result: false, error: 'L\'id est requis'});
  } 

  Sub.findOneAndDelete({ 
    _id: req.params.id,
    userId: req.user._id 
  }).then(sub => {
    if (!sub) {
      return res.json({result: false, error: 'Abonnement non trouvé ou non autorisé'});
    }
    res.json({result: true, sub});
  });
});

router.put('/update/:id', (req, res) => {
  const { name, price, billingCycle } = req.body;
        Sub.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { name, price, billingCycle }
  ).then(sub => {
    if (!sub) {
      return res.json({result: false, error: 'Abonnement non trouvé ou non autorisé'});
    }
    res.json({result: true, sub});
  });
});

module.exports = router;