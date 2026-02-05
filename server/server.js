const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Models
const Material = require('./models/Material');
const Subscriber = require('./models/Subscriber');

const app = express();

// --- 🛡️ SECURITY: THE VIP LIST (CORS) ---
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

// --- 🔐 SECURITY: THE LOCK (PASSWORD) ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mysecretpass";

const verifyAdmin = (req, res, next) => {
    const providedPassword = req.headers['admin-key'];
    if (providedPassword !== ADMIN_PASSWORD) {
        return res.status(403).json({ message: "⛔ Access Denied: Wrong Password" });
    }
    next();
};

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduportal';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- ✅ HEALTH CHECK ---
app.get('/', (req, res) => {
    res.send('Server is running and healthy! 🚀');
});

// --- 🌍 PUBLIC ROUTES ---
app.get('/api/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ date: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await Subscriber.findOne({ email });
        if (exists) return res.status(400).json({ message: "Already subscribed!" });
        
        const newSub = new Subscriber({ email });
        await newSub.save();
        res.status(201).json({ message: "Subscribed!" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// --- 🔐 PROTECTED ROUTES ---
app.post('/api/verify-admin', verifyAdmin, (req, res) => {
    res.json({ success: true, message: "Welcome Admin!" });
});

// 4. ✅ UPLOAD MATERIAL (UPDATED with Board)
app.post('/api/upload', verifyAdmin, async (req, res) => {
    try {
        // We now extract 'board' from the request
        const { title, category, subject, resourceType, link, board } = req.body;
        
        // And we save 'board' to the database
        const newMaterial = new Material({ title, category, subject, resourceType, link, board });
        
        await newMaterial.save();
        res.status(201).json(newMaterial);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. ✅ RENAME MATERIAL
app.put('/api/materials/:id', verifyAdmin, async (req, res) => {
    try {
        const { title } = req.body;
        const updatedMaterial = await Material.findByIdAndUpdate(
            req.params.id, 
            { title }, 
            { new: true }
        );
        res.json(updatedMaterial);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/materials/:id', verifyAdmin, async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/subscribe', verifyAdmin, async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ dateJoined: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching subscribers" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));