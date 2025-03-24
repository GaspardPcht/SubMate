require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
require('./models/connection');

var usersRouter = require('./routes/users');
const subscriptionRoutes = require('./routes/subs');
const supportRoutes = require('./routes/support');
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
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Routes API
app.use('/users', usersRouter);
app.use('/subs', subscriptionRoutes);
app.use('/support', supportRoutes);

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
