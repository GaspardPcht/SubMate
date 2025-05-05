require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
const cron = require('node-cron');
const { checkUpcomingSubscriptions } = require('./services/notificationService');
const { initCronJobs } = require('./services/cronService');
require('./models/connection');

var usersRouter = require('./routes/users');
const subscriptionRoutes = require('./routes/subs');
const supportRoutes = require('./routes/support');
const testNotificationsRoutes = require('./routes/test-notifications');
const notificationRoutes = require('./routes/notifications');
var app = express();

// Configuration CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB
mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('Connecté à MongoDB');
    
    // Initialize all cron jobs
    initCronJobs();
    
    // Configuration du cron job pour vérifier les abonnements tous les jours à 9h
    cron.schedule('0 9 * * *', async () => {
      console.log('Exécution de la vérification des abonnements...');
      try {
        await checkUpcomingSubscriptions();
        console.log('Vérification des abonnements terminée');
      } catch (error) {
        console.error('Erreur lors de la vérification des abonnements:', error);
      }
    }, {
      scheduled: true,
      timezone: "Europe/Paris"
    });
  })
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Routes API
app.use('/users', usersRouter);
app.use('/subs', subscriptionRoutes);
app.use('/support', supportRoutes);
app.use('/notifications', require('./routes/notifications'));

// Route de test des notifications
console.log('Enregistrement des routes de test');
app.use('/test', testNotificationsRoutes);
app.use('/notifications', notificationRoutes);

// Log toutes les routes disponibles
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log('Route disponible:', r.route.path);
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: '404',
      message: 'Route not found'
    }
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: '500',
      message: 'Internal Server Error'
    }
  });
});

module.exports = app;
