require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
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

// Routes API
app.use('/users', usersRouter);
app.use('/subs', subscriptionRoutes);
app.use('/api/support', supportRoutes);

module.exports = app;
