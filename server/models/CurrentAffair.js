const mongoose = require('mongoose');

const currentAffairSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    // We keep topics like National/Assam so students can filter them later if they want
    topic: {
        type: String,
        enum: ['National', 'Assam', 'International', 'Sports', 'Appointments', 'Other'],
        default: 'National'
    },
    headline: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    // 🆕 This makes your "Specific Event" section work!
    isSpecificEvent: {
        type: Boolean,
        default: false
    },
    eventName: {
        type: String, // e.g., "Union Budget 2026", "Chandrayaan-4 Launch"
        required: function() { return this.isSpecificEvent; } // Only required if it IS a specific event
    }
}, { timestamps: true });

module.exports = mongoose.model('CurrentAffair', currentAffairSchema);