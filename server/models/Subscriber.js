const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    dateJoined: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);