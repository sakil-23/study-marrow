const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  platform: { type: String, required: true }, // e.g., "Email", "WhatsApp"
  value: { type: String, required: true },    // e.g., "editor@studymarrow.com" or a URL
  isLink: { type: Boolean, default: false },  // If true, it renders as a blue "Click Here" button
  order: { type: Number, default: 0 }         // This allows us to move rows up and down!
});

module.exports = mongoose.model('Contact', contactSchema);