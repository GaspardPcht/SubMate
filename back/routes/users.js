var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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
      password: hash
    });
    
    user.save().then(newUser => {
      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ result: true, user: newUser, token });
    });
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

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ result: true, user, token });
  });
});

router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, password } = req.body;

  // Vérifier si l'utilisateur existe
  User.findById(id).then(user => {
    if (!user) {
      return res.json({ result: false, error: 'Utilisateur non trouvé' });
    }

    // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
    User.findOne({ email, _id: { $ne: id } }).then(existingUser => {
      if (existingUser) {
        return res.json({ result: false, error: 'Cet email est déjà utilisé' });
      }

      // Préparer les données à mettre à jour
      const updateData = { firstname, lastname, email };
      
      // Si un nouveau mot de passe est fourni, le hasher et l'ajouter aux données
      if (password) {
        updateData.password = bcrypt.hashSync(password, 10);
      }

      // Mettre à jour l'utilisateur
      User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).then(updatedUser => {
        res.json({ result: true, user: updatedUser });
      }).catch(error => {
        res.json({ result: false, error: 'Erreur lors de la mise à jour' });
      });
    });
  }).catch(error => {
    res.json({ result: false, error: 'Erreur lors de la recherche de l\'utilisateur' });
  });
});

module.exports = router;
