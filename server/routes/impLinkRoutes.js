const express = require('express');
const router = express.Router();
const ImpLink = require('../models/ImpLink');
const verifyAdmin = require('../middleware/authMiddleware'); // 🔐 NEW: Import the Security Guard

// POST a new link (Secured)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const newLink = new ImpLink(req.body);
    const savedLink = await newLink.save();
    res.status(201).json(savedLink);
  } catch (error) { res.status(400).json({ message: "Error saving link" }); }
});

// GET all links (Public - No guard needed)
router.get('/', async (req, res) => {
  try {
    const links = await ImpLink.find().sort({ dateAdded: -1 }); // Newest at top
    res.status(200).json(links);
  } catch (error) { res.status(500).json({ message: "Error fetching links" }); }
});

// DELETE a link (Secured)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await ImpLink.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Link deleted!" });
  } catch (error) { res.status(500).json({ message: "Error deleting link" }); }
});

module.exports = router;