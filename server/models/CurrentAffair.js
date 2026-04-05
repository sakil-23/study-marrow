const mongoose = require('mongoose');

const currentAffairSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
    title: { 
        type: String, 
        required: true // e.g., "Weekly One Liners: 15 March – 21 March 2026"
    },
    content: { 
        type: String, 
        required: true // The massive AI-generated study guide goes here
    },
    category: { 
        type: String, 
        required: true,
        enum: ['Weekly Current Affairs', 'Monthly Current Affairs', 'Specific Event Current Affairs']
    },
    pdfLink: { 
        type: String, 
        required: false // Only used if you manually upload a literal PDF
    },
    // 🪄 THE NEW FIELD FOR DRAG AND DROP:
    order: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

module.exports = mongoose.model('CurrentAffair', currentAffairSchema);