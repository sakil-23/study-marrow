const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Models
const Material = require('./models/Material');
const Subscriber = require('./models/Subscriber');

const app = express();

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
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Server is running and healthy! 🚀'));

// ✅ UPDATED: Sort by 'order' (Ascending 1, 2, 3...), then by 'date' (Newest first)
app.get('/api/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ order: 1, date: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ NEW ROUTE: BATCH REORDER (This saves the new positions)
app.put('/api/materials/reorder', verifyAdmin, async (req, res) => {
    try {
        const { updates } = req.body; // Expects list: [{id: "...", order: 1}, ...]
        
        // Loop through the list and update each file's position
        const operations = updates.map(item => {
            return Material.findByIdAndUpdate(item.id, { order: item.order });
        });

        await Promise.all(operations);
        res.json({ message: "Order updated successfully" });
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
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post('/api/verify-admin', verifyAdmin, (req, res) => res.json({ success: true }));


// 4. ✅ UPLOAD MATERIAL (UPDATED: AUTO-TOP)
app.post('/api/upload', verifyAdmin, async (req, res) => {
    try {
        const { title, category, subject, resourceType, link, board } = req.body;
        
        // 1. Find the current item with the Lowest order number (The Top Item)
        // We look specifically in the same Category and Subject
        const topItem = await Material.findOne({ category, subject }).sort({ order: 1 });
        
        // 2. Calculate new order: One step higher than the top item
        // If topItem is order 10, new is 9. If top is 0, new is -1.
        const newOrder = topItem ? topItem.order - 1 : 0;

        const newMaterial = new Material({ 
            title, category, subject, resourceType, link, board,
            order: newOrder // ✅ Places it at the very top
        });
        
        await newMaterial.save();
        res.status(201).json(newMaterial);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// RENAME ROUTE
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

app.delete('/api/materials/:id', verifyAdmin, async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/subscribe', verifyAdmin, async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ dateJoined: -1 });
        res.json(subs);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));