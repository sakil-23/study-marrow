const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 🛡️ NEW SECURITY PACKAGES
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Models
const Material = require('./models/Material');
const Subscriber = require('./models/Subscriber');

const app = express();

// ✅ CRITICAL FOR RENDER: Tells the rate-limiter to read the actual user's IP, not Render's IP.
app.set('trust proxy', 1);

// ==========================================
// 🛡️ SECURITY & CONFIG MIDDLEWARE
// ==========================================

// 1. Helmet: Secures HTTP headers and hides the "Express" footprint
app.use(helmet()); 

// 2. Mongo Sanitize: Blocks NoSQL Injection
app.use(mongoSanitize()); 

// 3. CORS: Preserved your exact domains
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
// General Rate Limiter: Protects against DDoS (Site crashing)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per 15 min
    message: { message: "⚠️ Too many requests from this IP. Please wait 15 minutes." }
});

// Strict Login Limiter: Protects against Brute-Force Password Hacking
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 6, // Locks out after 6 failed login attempts!
    message: { message: "🚫 Too many failed login attempts. You are locked out for 15 minutes." }
});

// Apply general limiter to all API routes
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

// 4. 🔐 VERIFY ADMIN (Now protected by strict login limiter!)
app.post('/api/verify-admin', loginLimiter, verifyAdmin, (req, res) => res.json({ success: true }));


// 5. ✅ UPLOAD MATERIAL (UPGRADED FOR MEGA-PORTAL)
app.post('/api/upload', verifyAdmin, async (req, res) => {
    try {
        // Now accurately accepting 'vertical' from your frontend
        const { vertical, title, category, subject, resourceType, link, board } = req.body;
        
        // Find the top item, strictly filtering by vertical as well
        const topItem = await Material.findOne({ vertical, category, subject }).sort({ order: 1 });
        const newOrder = topItem ? topItem.order - 1 : 0;

        const newMaterial = new Material({ 
            vertical, title, category, subject, resourceType, link, board,
            order: newOrder 
        });
        
        await newMaterial.save();
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
// Preserved your 0.0.0.0 binding
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Secure Server running on port ${PORT}`));