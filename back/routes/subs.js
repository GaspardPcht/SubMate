const express = require('express');
const router = express.Router();
const Sub = require('../models/sub');

router.get('/', (req, res) => {
  Sub.find().then(subs => res.json({result: true, subs}));
}); 

router.post('/create', (req, res) => {
  const { name, price, billingCycle } = req.body;
  if (!name || !price || !billingCycle) {
    return res.json({result: false, error: 'Tous les champs sont requis'});
  }

  Sub.findOne({ name }).then(existingSub => {
    if (existingSub) {
      return res.json({ result: false, error: 'Un abonnement avec ce nom existe déjà' });
    }
    
    const sub = new Sub({ name, price, billingCycle });
    sub.save().then(newSub => res.json({result: true, sub}));
  });
}); 

router.delete('/delete/:id', (req, res) => {
  if (!req.params.id) {
    return res.json({result: false, error: 'L\'id est requis'});
  } 
  
  Sub.findByIdAndDelete(req.params.id).then(sub => res.json({result: true, sub}));
});

router.put('/update/:id', (req, res) => {
  const { name, price, billingCycle } = req.body;
  Sub.findByIdAndUpdate(req.params.id, { name, price, billingCycle }).then(sub => res.json({result: true, sub}));
});

module.exports = router;