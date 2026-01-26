const axios = require('axios');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const fs = require('fs');

// Waste classification mapping
const wasteClassificationMap = {
  'cardboard': { category: 'paper', recycled: true, binColor: 'blue' },
  'glass': { category: 'glass', recycled: true, binColor: 'green' },
  'metal': { category: 'metal', recycled: true, binColor: 'yellow' },
  'paper': { category: 'paper', recycled: true, binColor: 'blue' },
  'plastic': { category: 'plastic', recycled: true, binColor: 'yellow' },
  'trash': { category: 'other', recycled: false, binColor: 'black' }
};

const disposalGuide = {
  'paper': 'Flatten cardboard boxes, keep paper dry. Recyclable.',
  'plastic': 'Check recycling code (1-7). Rinse before recycling.',
  'glass': 'Rinse glass containers. Remove lids. Recyclable.',
  'metal': 'Rinse and crush cans to save space. Recyclable.',
  'organic': 'Compostable items. Can be used for composting or organic waste bins.',
  'other': 'General trash. Not recyclable. Dispose in regular bin.'
};

// Classify waste image using Hugging Face API
async function classifyImage(req, res) {
  try {
    const { userId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Call Hugging Face API
    const huggingFaceResponse = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HUGGING_FACE_MODEL}`,
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );

    // Parse response and get top prediction
    const predictions = huggingFaceResponse.data;
    const topPrediction = predictions[0]; // First result is highest confidence

    // Map to our waste categories
    const classificationData = wasteClassificationMap[topPrediction.label.toLowerCase()] || {
      category: 'other',
      recycled: false,
      binColor: 'black'
    };

    // Store prediction in database
    const prediction = new Prediction({
      userId,
      imageUrl: `/uploads/${req.file.filename}`,
      originalFileName: req.file.originalname,
      category: classificationData.category,
      confidence: topPrediction.score,
      binColor: classificationData.binColor,
      recycled: classificationData.recycled,
      disposalGuidance: disposalGuide[classificationData.category],
      userFeedback: null
    });

    await prediction.save();

    // Update user stats
    await User.findOneAndUpdate(
      { userId },
      { $inc: { totalPredictions: 1 } },
      { upsert: true, new: true }
    );

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      prediction: {
        id: prediction._id,
        category: classificationData.category,
        confidence: (topPrediction.score * 100).toFixed(2),
        binColor: classificationData.binColor,
        recycled: classificationData.recycled,
        disposalGuidance: disposalGuide[classificationData.category],
        createdAt: prediction.createdAt
      }
    });

  } catch (error) {
    console.error('Classification error:', error.message);
    
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Classification failed',
      message: error.message
    });
  }
}

// Submit feedback on prediction accuracy
async function submitFeedback(req, res) {
  try {
    const { predictionId, feedback } = req.body;

    if (!predictionId || !feedback) {
      return res.status(400).json({ error: 'Prediction ID and feedback are required' });
    }

    const prediction = await Prediction.findByIdAndUpdate(
      predictionId,
      { userFeedback: feedback },
      { new: true }
    );

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    // Update user accuracy stats
    if (feedback === 'correct') {
      await User.findOneAndUpdate(
        { userId: prediction.userId },
        { $inc: { correctPredictions: 1 } }
      );
    }

    res.json({
      success: true,
      message: 'Feedback submitted',
      prediction
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  classifyImage,
  submitFeedback
};
