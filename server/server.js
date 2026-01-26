const Subscriber = require('./models/Subscriber');

// Add these lines at the VERY TOP of server.js
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (e) {}


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Material = require('./models/Material');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// You will get this URL from MongoDB Atlas website
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduportal';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
// 1. ADD New Material
app.post('/api/materials', async (req, res) => {
    try {
        const newMaterial = new Material(req.body);
        await newMaterial.save();
        res.status(201).json(newMaterial);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 2. DELETE Material
app.delete('/api/materials/:id', async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Routes
const materialRoutes = require('./routes/materials');
app.use('/api/materials', materialRoutes);
// --- ADMIN ROUTES ---


const PORT = process.env.PORT || 5000;
// --- NEWSLETTER ROUTE ---
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. Check if email already exists
        const exists = await Subscriber.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "You are already subscribed!" });
        }

        // 2. Save new email
        const newSub = new Subscriber({ email });
        await newSub.save();
        
        res.status(201).json({ message: "Successfully subscribed to updates!" });
    } catch (err) {
        res.status(500).json({ message: "Server error. Please try again." });
    }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));