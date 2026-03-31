const mongoose = require('mongoose');

const currentAffairSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
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
    // 🆕 This allows you to optionally attach an official PDF notice to the news!
    pdfLink: { 
        type: String, 
        required: false 
    }, 
    isSpecificEvent: { 
        type: Boolean, 
        default: false 
    },
    eventName: { 
        type: String, 
        required: function() { return this.isSpecificEvent; } 
    }
}, { timestamps: true });

module.exports = mongoose.model('CurrentAffair', currentAffairSchema);