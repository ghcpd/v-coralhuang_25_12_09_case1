const express = require('express');
const Prediction = require('../models/Prediction');

const router = express.Router();

// Simple analytics: top labels and accuracy
router.get('/', async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$label', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const top = await Prediction.aggregate(pipeline);

    const total = await Prediction.countDocuments();
    const correctCount = await Prediction.countDocuments({ correct: true });

    res.json({ top, total, correctCount, accuracy: total ? correctCount / total : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
