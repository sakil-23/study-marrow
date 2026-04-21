const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer'); 
const verifyAdmin = require('../middleware/authMiddleware'); // 🔐 Security Guard
require('dotenv').config();

// ==========================================
// 📧 ZOHO MAIL TRANSPORTER CONFIGURATION
// ==========================================
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in', 
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// ==========================================
// POST: ADD A NEW SUBSCRIBER (Public)
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email is already subscribed!" });
    }
    
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    const mailOptions = {
      from: `"Study Marrow Careers" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Study Marrow Careers! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #1e3a8a;">Welcome to the Community!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to <strong>Study Marrow Careers</strong>!</p>
          <p>You are now on our VIP list. We will send you instant email alerts whenever we publish new Govt & Private Job Vacancies, Admit Cards, Scholarships, and Exam Results.</p>
          <p>Best Regards,<br/><strong>The Study Marrow Team</strong></p>
          <p><a href="https://careers.studymarrow.in" style="color: #2563eb; text-decoration: none;">careers.studymarrow.in</a></p>
        </div>
      `
    };

    transporter.sendMail(mailOptions).catch(err => console.error('Welcome email failed:', err));
    res.status(201).json({ message: "Successfully subscribed!" });

  } catch (error) { 
    res.status(500).json({ message: "Error saving subscription" }); 
  }
});

// ==========================================
// GET: VIEW ALL SUBSCRIBERS (Secured Admin Only)
// ==========================================
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ _id: -1 }); // Newest first
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
});

// ==========================================
// DELETE: REMOVE A SUBSCRIBER (Secured Admin Only)
// ==========================================
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subscriber removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subscriber" });
  }
});

module.exports = router;