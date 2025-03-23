const express = require('express');
const router = express.Router();
const { sendSupportEmail } = require('../services/emailService');
const auth = require('../middleware/auth');
const User = require('../models/user');

router.post('/submit', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const supportData = {
      ...req.body,
      user: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    };

    await sendSupportEmail(supportData);

    res.status(200).json({
      success: true,
      message: 'Votre demande a été envoyée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la demande de support:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi de votre demande'
    });
  }
});

module.exports = router; 