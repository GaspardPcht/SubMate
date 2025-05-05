const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Register or update push notification token
router.post('/register-push-token', auth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    const userId = req.userData.userId;

    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    await User.findByIdAndUpdate(userId, { pushToken });
    
    res.json({ message: 'Push token registered successfully' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

module.exports = router;
