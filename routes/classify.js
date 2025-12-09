const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const History = require('../models/History');
require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });

// Disposal guidance mapping
const disposalGuide = {
  cardboard: { recyclable: true, binColor: 'blue' },
  glass: { recyclable: true, binColor: 'green' },
  metal: { recyclable: true, binColor: 'blue' },
  paper: { recyclable: true, binColor: 'blue' },
  plastic: { recyclable: true, binColor: 'blue' },
  trash: { recyclable: false, binColor: 'black' }
};

router.post('/classify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');

    // Call Hugging Face API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/nikhilroxtomar/garbage-classification',
      { inputs: imageBase64 },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Assuming the model returns an array of predictions
    const predictions = response.data;
    const topPrediction = predictions[0]; // Assuming sorted by confidence

    const category = topPrediction.label.toLowerCase();
    const confidence = topPrediction.score;

    const guidance = disposalGuide[category] || { recyclable: false, binColor: 'unknown' };

    // Save to history
    const historyEntry = new History({
      image: imageBase64,
      prediction: category,
      confidence: confidence,
      recyclable: guidance.recyclable,
      binColor: guidance.binColor
    });

    await historyEntry.save();

    res.json({
      prediction: category,
      confidence: confidence,
      recyclable: guidance.recyclable,
      binColor: guidance.binColor,
      id: historyEntry._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Classification failed' });
  }
});

// Get history
router.get('/history', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Update feedback
router.put('/feedback/:id', async (req, res) => {
  try {
    const { feedback } = req.body;
    await History.findByIdAndUpdate(req.params.id, { userFeedback: feedback });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const total = await History.countDocuments();
    const correct = await History.countDocuments({ userFeedback: 'correct' });
    const incorrect = await History.countDocuments({ userFeedback: 'incorrect' });
    const topItems = await History.aggregate([
      { $group: { _id: '$prediction', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalPredictions: total,
      accuracy: total > 0 ? (correct / (correct + incorrect)) * 100 : 0,
      topItems: topItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;