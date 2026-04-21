const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topicName: { type: String, required: true },
  description: { type: String },
  section1Heading: String, section1Details: String,
  section2Heading: String, section2Details: String,
  section3Heading: String, section3Details: String,
  section4Heading: String, section4Details: String,
  section5Heading: String, section5Details: String,
  section6Heading: String, section6Details: String,
  section7Heading: String, section7Details: String,
  link1Name: String, link1Url: String,
  link2Name: String, link2Url: String,
  link3Name: String, link3Url: String,
  link4Name: String, link4Url: String,
  link5Name: String, link5Url: String,
  link6Name: String, link6Url: String,
  link7Name: String, link7Url: String,
  order: { type: Number, default: 0 }, // 🔥 ADD THIS LINE
  datePosted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);