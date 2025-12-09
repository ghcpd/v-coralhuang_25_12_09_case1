const express = require('express');
const router = express.Router();
const { getHistory, getPrediction, deletePrediction } = require('../controllers/historyController');

// GET: User's prediction history
router.get('/:userId', getHistory);

// GET: Single prediction details
router.get('/prediction/:predictionId', getPrediction);

// DELETE: Remove a prediction
router.delete('/:predictionId', deletePrediction);

module.exports = router;
