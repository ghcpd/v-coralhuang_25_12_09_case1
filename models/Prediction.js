const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  filename: String,
  label: String,
  score: Number,
  guidance: String,
  createdAt: { type: Date, default: Date.now },
  correct: { type: Boolean, default: null }
});

module.exports = mongoose.models.Prediction || mongoose.model('Prediction', predictionSchema);
