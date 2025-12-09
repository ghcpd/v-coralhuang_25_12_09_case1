const express = require('express');
const Prediction = require('../models/Prediction');

const router = express.Router();

// Get recent predictions
router.get('/', async (req, res) => {
  try {
    const items = await Prediction.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Feedback to mark correctness
router.post('/feedback', async (req, res) => {
  try {
    const { id, correct } = req.body;
    const doc = await Prediction.findByIdAndUpdate(id, { correct }, { new: true });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
