const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Needed for file uploads
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import Models
const Material = require('./models/Material');
const Subscriber = require('./models/Subscriber');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically so they can be downloaded
app.use('/uploads', express.static('uploads'));

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduportal';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- MULTER CONFIGURATION (The File Uploader) ---
// Ensure 'uploads' folder exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files to 'uploads' folder
    },
    filename: (req, file, cb) => {
        // Name file: Date-OriginalName (to prevent duplicates)
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });


// --- ROUTES ---

// 1. UPLOAD MATERIAL (With Subject & Type)
// This matches the AdminPanel code I gave you
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const { title, category, subject, resourceType } = req.body;
        
        // Use the file path from Multer
        // Note: On Render (free tier), files disappear after restart. 
        // For permanent storage, we'd need AWS S3, but this works for now.
        const link = req.file ? `https://study-marrow-api.onrender.com/uploads/${req.file.filename}` : '';

        const newMaterial = new Material({
            title,
            category,
            subject,       // New Field
            resourceType,  // New Field
            link
        });

        await newMaterial.save();
        res.status(201).json(newMaterial);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. GET ALL MATERIALS
app.get('/api/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ date: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. DELETE MATERIAL
app.delete('/api/materials/:id', async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. SUBSCRIBE (Newsletter)
app.post('/api/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await Subscriber.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "You are already subscribed!" });
        }
        const newSub = new Subscriber({ email });
        await newSub.save();
        res.status(201).json({ message: "Successfully subscribed!" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 5. GET SUBSCRIBERS (For Admin)
app.get('/api/subscribe', async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ dateJoined: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching subscribers" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 