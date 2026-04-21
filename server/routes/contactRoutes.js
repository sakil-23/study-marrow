const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const verifyAdmin = require('../middleware/authMiddleware'); // 🔐 NEW: Import the Security Guard

// GET all contacts (Public - No Guard Needed)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ order: 1 });
    res.status(200).json(contacts);
  } catch (error) { res.status(500).json({ message: "Error fetching contacts" }); }
});

// POST a new contact (Secured)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    // Count existing ones so the new one goes to the very bottom
    const count = await Contact.countDocuments();
    const newContact = new Contact({ ...req.body, order: count });
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) { res.status(400).json({ message: "Error saving contact" }); }
});

// PUT (Update) a contact - Used for Editing AND moving Up/Down (Secured)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ message: "Error updating contact" }); }
});

// DELETE a contact (Secured)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Contact deleted!" });
  } catch (error) { res.status(500).json({ message: "Error deleting contact" }); }
});

module.exports = router;