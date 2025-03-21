var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const uid2 = require('uid2');
const User = require('../models/user');
const token = uid2(32);

router.get('/', (req, res) => {
  User.find().then(users => res.json({result: true, users}));
});

router.post('/signup', (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  User.findOne({ email }).then(existingUser => {
    if (existingUser) {
      res.json({ result: false, error: 'Cet email est déjà utilisé' });
      return;
    }

    const user = new User({ 
      firstname, 
      lastname, 
      email, 
      password: hash,
      token 
    });
    
    user.save().then(newUser => res.json({ result: true, user: newUser }));
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).then(user => {
    if (!user) {
      res.json({ result: false, error: 'Cet email n\'existe pas' });
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.json({ result: false, error: 'Mot de passe incorrect' });
      return;
    }

    res.json({ result: true, user, token });
  });
});


module.exports = router;
