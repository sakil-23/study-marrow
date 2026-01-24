const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Class 10', 'Class 12', 'Current Affairs'], 
        required: true 
    },
    subCategory: { type: String }, // e.g., "NCERT Solutions", "Physics"
    type: { type: String }, // e.g., "PDF", "Video", "Article"
    link: { type: String, required: true }, // Link to the file (S3 or Drive)
    dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);