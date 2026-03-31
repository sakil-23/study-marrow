const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    vertical: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    subject: { type: String },
    resourceType: { type: String },
    link: { type: String, required: false }, // ✅ Now optional
    description: { type: String, required: false }, // 🆕 Added for Articles/Notes
    board: { type: String },
    order: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);