require('dotenv').config();
const mongoose = require('mongoose');
const { checkUpcomingSubscriptions } = require('../services/notificationService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/submate';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    await checkUpcomingSubscriptions();
    console.log('Vérification des abonnements terminée');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

main();
