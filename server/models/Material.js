const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Class 10
    subject: { type: String, required: true },  // e.g., Maths
    resourceType: { type: String, required: true }, // e.g., Previous Year Papers
    board: { type: String }, // ✅ NEW: Stores "CBSE" or "SEBA" (Optional)
    link: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);