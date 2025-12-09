const express = require('express');
const router = express.Router();
const { getAnalytics, getLeaderboard } = require('../controllers/analyticsController');

// GET: User analytics and impact stats
router.get('/user/:userId', getAnalytics);

// GET: Leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
