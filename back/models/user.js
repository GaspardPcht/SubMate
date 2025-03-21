const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, required: true },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sub' }]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
