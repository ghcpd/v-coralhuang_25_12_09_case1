const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  image: {
    type: String, // base64 or path, but for simplicity, store base64
    required: true
  },
  prediction: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  recyclable: {
    type: Boolean,
    required: true
  },
  binColor: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userFeedback: {
    type: String, // correct/incorrect
    default: null
  }
});

module.exports = mongoose.model('History', historySchema);