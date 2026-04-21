const mongoose = require('mongoose');

const impLinkSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImpLink', impLinkSchema);