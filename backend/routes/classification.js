const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { classifyImage, submitFeedback } = require('../controllers/classificationController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST: Classify waste image
router.post('/classify', upload.single('image'), classifyImage);

// POST: Submit feedback on prediction accuracy
router.post('/feedback', submitFeedback);

module.exports = router;
