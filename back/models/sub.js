const mongoose = require('mongoose');

const SubSchema = mongoose.Schema({
 name: { type: String, required: true },
 price: { type: Number, required: true },
 billingCycle: { type: String, required: true },
 nextBillingDate: { type: Date, required: true },
});

const Sub = mongoose.model('Sub', SubSchema);

module.exports = Sub;
