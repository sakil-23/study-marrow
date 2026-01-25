const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// GET all materials
router.get('/', async (req, res) => {
    try {
        const materials = await Material.find().sort({ dateAdded: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET materials by Category (e.g., Class 10)
router.get('/:category', async (req, res) => {
    try {
        const materials = await Material.find({ category: req.params.category });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new material (For the Admin Panel)
router.post('/', async (req, res) => {
    const material = new Material({
        title: req.body.title,
        category: req.body.category,
        subCategory: req.body.subCategory,
        link: req.body.link
    });

    try {
        const newMaterial = await material.save();
        res.status(201).json(newMaterial);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;