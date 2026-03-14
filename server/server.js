const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 🛡️ SECURITY PACKAGES
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// 📧 EMAIL PACKAGE
const nodemailer = require('nodemailer');

// Models
const Material = require('./models/Material');
const Subscriber = require('./models/Subscriber');

const app = express();

// ✅ CRITICAL FOR RENDER: Tells the rate-limiter to read the actual user's IP
app.set('trust proxy', 1);

// ==========================================
// 📧 EMAIL TRANSPORTER SETUP
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("⚠️ Email Service Error (Check EMAIL_USER and EMAIL_PASS):", error);
    } else {
        console.log("📧 Email Service is Ready!");
    }
});

// ==========================================
// 🛡️ SECURITY & CONFIG MIDDLEWARE
// ==========================================
app.use(helmet()); 
app.use(mongoSanitize()); 
app.use(cors({
    origin: [
        "https://study-marrow.vercel.app",
        "http://localhost:3000",
        "https://studymarrow.com",
        "https://www.studymarrow.com"
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));

app.use(express.json());

// --- RATE LIMITERS ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    message: { message: "⚠️ Too many requests from this IP. Please wait 15 minutes." }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 6, 
    message: { message: "🚫 Too many failed login attempts. You are locked out for 15 minutes." }
});

app.use('/api/', apiLimiter);

// ==========================================
// 🗄️ DATABASE & AUTH
// ==========================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mysecretpass";

const verifyAdmin = (req, res, next) => {
    const providedPassword = req.headers['admin-key'];
    if (providedPassword !== ADMIN_PASSWORD) {
        return res.status(403).json({ message: "⛔ Access Denied: Wrong Password" });
    }
    next();
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduportal';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Securely'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Server is running and healthy! 🚀'));

// ==========================================
// 🚀 API ROUTES
// ==========================================

// 1. GET ALL MATERIALS
app.get('/api/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ order: 1, date: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. REORDER MATERIALS
app.put('/api/materials/reorder', verifyAdmin, async (req, res) => {
    try {
        const { updates } = req.body; 
        const operations = updates.map(item => {
            return Material.findByIdAndUpdate(item.id, { order: item.order });
        });
        await Promise.all(operations);
        res.json({ message: "Order updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. ADD SUBSCRIBER
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await Subscriber.findOne({ email });
        if (exists) return res.status(400).json({ message: "Already subscribed!" });
        
        const newSub = new Subscriber({ email });
        await newSub.save();
        res.status(201).json({ message: "Subscribed!" });
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// 4. VERIFY ADMIN
app.post('/api/verify-admin', loginLimiter, verifyAdmin, (req, res) => res.json({ success: true }));


// 5. ✅ UPLOAD MATERIAL (WITH EMAIL AUTOMATION EXCLUDING ADMIN)
app.post('/api/upload', verifyAdmin, async (req, res) => {
    try {
        const { vertical, title, category, subject, resourceType, link, board } = req.body;
        
        const topItem = await Material.findOne({ vertical, category, subject }).sort({ order: 1 });
        const newOrder = topItem ? topItem.order - 1 : 0;

        const newMaterial = new Material({ 
            vertical, title, category, subject, resourceType, link, board,
            order: newOrder 
        });
        
        await newMaterial.save();

        // ✉️ --- SEND EMAIL NOTIFICATION ---
        try {
            const subs = await Subscriber.find({}, 'email');
            
            if (subs.length > 0 && process.env.EMAIL_USER) {
                // Extract emails and strictly filter out the sender's own email address
                const bccList = subs
                    .map(s => s.email)
                    .filter(email => email !== process.env.EMAIL_USER)
                    .join(',');

                if (bccList.length > 0) {
                    const mailOptions = {
                        from: `"Study Marrow" <${process.env.EMAIL_USER}>`,
                        to: `"Study Marrow Subscribers" <noreply@studymarrow.com>`, // Dummy target stops Gmail routing it back to you
                        bcc: bccList, // BCC protects everyone's privacy
                        subject: `📚 New Upload: ${title}`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                                <div style="background-color: #0f172a; padding: 20px; text-align: center;">
                                    <h1 style="color: white; margin: 0;">Study Marrow</h1>
                                </div>
                                <div style="padding: 30px; background-color: #f8fafc;">
                                    <h2 style="color: #1e293b; margin-top: 0;">New Material Added! 🚀</h2>
                                    <p style="color: #475569; font-size: 16px;">We have just uploaded a new resource to help with your preparation.</p>
                                    
                                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                                        <p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p>
                                        <p style="margin: 5px 0;"><strong>Category:</strong> ${vertical} > ${category} ${subject ? '> ' + subject : ''}</p>
                                        <p style="margin: 5px 0;"><strong>Type:</strong> ${resourceType}</p>
                                    </div>

                                    <div style="text-align: center; margin-top: 30px;">
                                        <a href="${link}" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Material</a>
                                    </div>
                                </div>
                                <div style="text-align: center; padding: 15px; font-size: 12px; color: #94a3b8;">
                                    You are receiving this because you subscribed to Study Marrow updates.
                                </div>
                            </div>
                        `
                    };

                    // Send without awaiting so the upload finishes instantly for you
                    transporter.sendMail(mailOptions).catch(err => console.error("Email failed:", err));
                }
            }
        } catch (emailError) {
            console.error("Error sending emails:", emailError);
        }
        // ----------------------------------------

        res.status(201).json(newMaterial);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. RENAME MATERIAL
app.put('/api/materials/:id', verifyAdmin, async (req, res) => {
    try {
        const { title } = req.body;
        const updatedMaterial = await Material.findByIdAndUpdate(
            req.params.id, 
            { title }, 
            { new: true }
        );
        res.json(updatedMaterial);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 7. DELETE MATERIAL
app.delete('/api/materials/:id', verifyAdmin, async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 8. GET SUBSCRIBERS
app.get('/api/subscribe', verifyAdmin, async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ dateJoined: -1 });
        res.json(subs);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

// ==========================================
// 🏁 START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Secure Server running on port ${PORT}`));