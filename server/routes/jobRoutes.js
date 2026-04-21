const express = require('express');
const router = express.Router();
const Job = require('../models/Job'); 
const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer'); 
const verifyAdmin = require('../middleware/authMiddleware'); 
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

// Helper function to split massive email lists into smaller, safe chunks
const chunkArray = (array, size) => {
  const chunkedArr = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
};

// ==========================================
// CREATE A NEW JOB POST (Secured)
// ==========================================
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newJob = new Job(req.body); 
    const savedJob = await newJob.save(); 

    // --- AUTOMATED EMAIL BLAST LOGIC ---
    try {
      const subscribers = await Subscriber.find();
      const emailList = subscribers.map(sub => sub.email);

      if (emailList.length > 0) {
        const cleanDescription = savedJob.description ? savedJob.description.replace(/<[^>]*>?/gm, '') : '';
        
        // ⚠️ THE FIX: Break the email list into batches of 40 to avoid Zoho Spam Limits
        const emailBatches = chunkArray(emailList, 40);
        
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #1e3a8a;">New Notification from Study Marrow Careers</h2>
            <p style="font-size: 16px; color: #334155;"><strong>${savedJob.company}</strong> has released a new update: <strong>${savedJob.title}</strong>.</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">${cleanDescription.substring(0, 150)}...</p>
            <br/>
            <p style="text-align: center;">
              <a href="https://careers.studymarrow.in/job/${savedJob._id}" style="display: inline-block; padding: 12px 25px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">Click Here to Read More</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">You are receiving this because you subscribed to updates on careers.studymarrow.in</p>
          </div>
        `;

        // Loop through each batch of 40 and send
        for (const batch of emailBatches) {
          const mailOptions = {
            from: `"Study Marrow Careers" <${process.env.EMAIL_USER}>`, 
            to: process.env.EMAIL_USER, // Send to self
            bcc: batch,                 // Attach only 40 subscribers at a time
            subject: `New Update: ${savedJob.title} - ${savedJob.company}`,
            html: htmlContent
          };
          
          await transporter.sendMail(mailOptions);
        }

        console.log(`✅ Success: Emails sent to ${emailList.length} subscribers in ${emailBatches.length} batches.`);
      }
    } catch (emailErr) {
      console.log("❌ Failed to process emails, but job was saved successfully.", emailErr);
    }
    // ----------------------------------------

    res.status(201).json(savedJob); 
    
  } catch (error) {
    res.status(400).json({ message: "Failed to save job", error: error.message });
  }
});

// ==========================================
// GET ALL JOB POSTS (Public - No Guard Needed)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ datePosted: -1 }); 
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
});

// ==========================================
// UPDATE A JOB POST (Secured)
// ==========================================
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
});

// ==========================================
// DELETE A JOB POST (Secured)
// ==========================================
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
});

module.exports = router;