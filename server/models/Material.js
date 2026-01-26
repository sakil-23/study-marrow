const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "Class 12 Materials"
    subject: { type: String },                 // NEW: e.g. "Physics"
    resourceType: { type: String },            // NEW: e.g. "Handwritten Notes"
    link: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);