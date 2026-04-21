const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');

// Get all notices
router.get('/', async (req, res) => {
  try {
    // 🔥 CHANGE the sort to look at order first!
    const notices = await Notice.find().sort({ order: 1, datePosted: -1 }); 
    res.json(notices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create a notice
router.post('/', async (req, res) => {
  const notice = new Notice(req.body);
  try {
    const savedNotice = await notice.save();
    res.status(201).json(savedNotice);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update a notice
router.put('/:id', async (req, res) => {
  try {
    const updatedNotice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNotice);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Delete a notice
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;