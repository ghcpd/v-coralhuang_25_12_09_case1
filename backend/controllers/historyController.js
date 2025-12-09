const Prediction = require('../models/Prediction');
const User = require('../models/User');

// Get user's prediction history
async function getHistory(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const predictions = await Prediction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Prediction.countDocuments({ userId });

    res.json({
      success: true,
      data: predictions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + predictions.length < total
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get single prediction details
async function getPrediction(req, res) {
  try {
    const { predictionId } = req.params;

    const prediction = await Prediction.findById(predictionId);

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete a prediction
async function deletePrediction(req, res) {
  try {
    const { predictionId } = req.params;

    const prediction = await Prediction.findByIdAndDelete(predictionId);

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    // Decrement user stats
    await User.findOneAndUpdate(
      { userId: prediction.userId },
      {
        $inc: {
          totalPredictions: -1,
          correctPredictions: prediction.userFeedback === 'correct' ? -1 : 0
        }
      }
    );

    res.json({
      success: true,
      message: 'Prediction deleted'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getHistory,
  getPrediction,
  deletePrediction
};
