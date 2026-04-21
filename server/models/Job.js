const mongoose = require('mongoose');

// Define the blueprint for a Job Post
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, 
    trim: true      
  },
  company: {
    type: String,
    required: true
  },
  
  // ==========================================
  // NEW FIELD: Slot to paste the logo image link!
  // ==========================================
  imageUrl: { 
    type: String, 
    default: '' 
  },
  
  // CHANGED: Location is now completely optional!
  location: {
    type: String,
    required: false,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  deadline: {
    type: String, 
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'General' 
  },

  // ==========================================
  // 7 DYNAMIC CONTENT SECTIONS (Headings + Details)
  // ==========================================
  section1Heading: { type: String, default: '' },
  section1Details: { type: String, default: '' },
  
  section2Heading: { type: String, default: '' },
  section2Details: { type: String, default: '' },
  
  section3Heading: { type: String, default: '' },
  section3Details: { type: String, default: '' },
  
  section4Heading: { type: String, default: '' },
  section4Details: { type: String, default: '' },

  // 🔥 NEW: Added Sections 5, 6, and 7!
  section5Heading: { type: String, default: '' },
  section5Details: { type: String, default: '' },

  section6Heading: { type: String, default: '' },
  section6Details: { type: String, default: '' },

  section7Heading: { type: String, default: '' },
  section7Details: { type: String, default: '' },

  // ==========================================
  // 7 DYNAMIC LINK SLOTS
  // ==========================================
  // Link 1 is mandatory so there is always at least one link to click
  link1Name: { type: String, default: 'Online Application Form' },
  link1Url: { type: String, required: true }, 

  // Links 2 through 7 are completely optional
  link2Name: { type: String, default: '' },
  link2Url:  { type: String, default: '' },
  
  link3Name: { type: String, default: '' },
  link3Url:  { type: String, default: '' },
  
  link4Name: { type: String, default: '' },
  link4Url:  { type: String, default: '' },
  
  link5Name: { type: String, default: '' },
  link5Url:  { type: String, default: '' },
  
  link6Name: { type: String, default: '' },
  link6Url:  { type: String, default: '' },
  
  link7Name: { type: String, default: '' },
  link7Url:  { type: String, default: '' },

  datePosted: {
    type: Date,
    default: Date.now 
  }
});

// Turn the blueprint into a functional model and export it
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;