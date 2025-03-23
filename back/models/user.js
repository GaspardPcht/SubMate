const mongoose = require('mongoose');

const SubscriptionSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  billingCycle: { 
    type: String, 
    required: true,
    enum: ['monthly', 'yearly']
  },
  nextBillingDate: { type: Date },
  category: { type: String, default: 'other' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true }); // On garde _id pour la compatibilité avec le frontend

const UserSchema = mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptions: [SubscriptionSchema]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
