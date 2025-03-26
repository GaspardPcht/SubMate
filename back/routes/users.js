var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');
const auth = require('../middleware/auth');

// Déterminer l'environnement
const isProduction = process.env.NODE_ENV === 'production';
const ENV_ID = isProduction ? 'prod' : 'dev';

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
        { 
          userId: newUser._id,
          env: ENV_ID
        },
        process.env.JWT_SECRET,
        { noTimestamp: true }
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
      { 
        userId: user._id,
        env: ENV_ID
      },
      process.env.JWT_SECRET,
      { noTimestamp: true }
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

// Route pour demander une réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('Demande de réinitialisation de mot de passe reçue pour:', req.body.email);
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return res.json({ result: false, error: 'Aucun utilisateur trouvé avec cet email' });
    }

    // Générer un mot de passe aléatoire
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();
    console.log('Nouveau mot de passe sauvegardé');

    console.log('Tentative d\'envoi de l\'email...');
    // Envoyer l'email avec le nouveau mot de passe
    await sendPasswordResetEmail(email, newPassword);
    console.log('Email envoyé avec succès');

    res.json({
      result: true,
      message: 'Un email avec votre nouveau mot de passe a été envoyé'
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la demande de réinitialisation:', error);
    console.error('Stack trace:', error.stack);
    res.json({
      result: false,
      error: 'Une erreur est survenue lors de l\'envoi de l\'email'
    });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.json({
        result: false,
        error: 'Token de réinitialisation invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({
      result: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.json({
      result: false,
      error: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
    });
  }
});

// Route pour vérifier l'état de la session
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId).select('-password');
    if (!user) {
      return res.status(404).json({ result: false, error: 'Utilisateur non trouvé' });
    }
    res.json({ result: true, user });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
