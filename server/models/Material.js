const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    resourceType: { type: String, required: true },
    board: { type: String }, 
    link: { type: String, required: true },
    date: { type: Date, default: Date.now },
    order: { type: Number, default: 0 } // ✅ NEW: Tracks position
});

module.exports = mongoose.model('Material', materialSchema);