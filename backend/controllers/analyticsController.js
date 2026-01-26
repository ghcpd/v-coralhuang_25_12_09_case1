const Prediction = require('../models/Prediction');
const User = require('../models/User');

// Get user analytics and impact stats
async function getAnalytics(req, res) {
  try {
    const { userId } = req.params;

    // Get user info
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get category distribution
    const categoryStats = await Prediction.aggregate([
      { $match: { userId } },
      { $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get top items (most frequent predictions)
    const topItems = await Prediction.aggregate([
      { $match: { userId } },
      { $group: {
          _id: '$category',
          count: { $sum: 1 },
          recycled: { $first: '$recycled' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get daily impact (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyImpact = await Prediction.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          recycledCount: {
            $sum: { $cond: ['$recycled', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate accuracy
    const accuracy = user.totalPredictions > 0
      ? (user.correctPredictions / user.totalPredictions * 100).toFixed(2)
      : 0;

    // Calculate environmental impact
    const recyclableItems = await Prediction.countDocuments({
      userId,
      recycled: true,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      analytics: {
        totalPredictions: user.totalPredictions,
        accuracy: parseFloat(accuracy),
        categoryBreakdown: categoryStats,
        topItems,
        dailyImpact,
        weeklyRecyclableItems: recyclableItems,
        recyclablePercentage: user.totalPredictions > 0
          ? (recyclableItems / user.totalPredictions * 100).toFixed(2)
          : 0
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get leaderboard (top users by predictions)
async function getLeaderboard(req, res) {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await User.find()
      .sort({ totalPredictions: -1 })
      .limit(parseInt(limit))
      .select('userId totalPredictions correctPredictions');

    const enhanced = leaderboard.map(user => ({
      userId: user.userId,
      totalPredictions: user.totalPredictions,
      accuracy: user.totalPredictions > 0
        ? (user.correctPredictions / user.totalPredictions * 100).toFixed(2)
        : 0
    }));

    res.json({
      success: true,
      data: enhanced
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAnalytics,
  getLeaderboard
};
