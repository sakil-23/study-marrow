const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Models
const Material = require('./models/Material');
const Subscriber = require('./models/Subscriber');

const app = express();
// --- CORS CONFIGURATION (The VIP List) ---
app.use(cors({
    origin: ["https://study-marrow.vercel.app", "http://localhost:3000"], // Only allow your site & local testing
    methods: ["GET", "POST", "DELETE"], // Only allow these actions
    credentials: true
}));
app.use(express.json());

// --- 🔒 SECURITY CONFIGURATION ---
// CHANGE "mysecretpass" TO YOUR OWN UNIQUE PASSWORD HERE!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mysecretpass";

// Middleware: The Bouncer
// This function checks every request for the password
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

// --- PUBLIC ROUTES (No Password Needed) ---
// Students can verify materials and subscribe without a password

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

// --- 🔐 PROTECTED ROUTES (Password Required) ---
// We add 'verifyAdmin' before the actual logic

// 1. Verify Login (New Route to check password)
app.post('/api/verify-admin', verifyAdmin, (req, res) => {
    res.json({ success: true, message: "Welcome Admin!" });
});

// 2. Upload Material
app.post('/api/upload', verifyAdmin, async (req, res) => {
    try {
        const { title, category, subject, resourceType, link } = req.body;
        const newMaterial = new Material({ title, category, subject, resourceType, link });
        await newMaterial.save();
        res.status(201).json(newMaterial);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Delete Material
app.delete('/api/materials/:id', verifyAdmin, async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Get Subscriber List (Admin Only)
app.get('/api/subscribe', verifyAdmin, async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ dateJoined: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching subscribers" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));