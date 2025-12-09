const express = require('express');
const router = express.Router();

const predictController = require('./controllers/predictController');
const historyController = require('./controllers/historyController');

router.post('/predict', predictController.predict);
router.get('/history', historyController.list);

module.exports = router;