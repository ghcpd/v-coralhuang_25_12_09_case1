const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  originalFileName: String,
  category: {
    type: String,
    required: true,
    enum: ['paper', 'plastic', 'glass', 'metal', 'organic', 'other']
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  binColor: {
    type: String,
    enum: ['blue', 'green', 'yellow', 'red', 'black', 'brown']
  },
  recycled: Boolean,
  disposalGuidance: String,
  userFeedback: {
    type: String,
    enum: ['correct', 'incorrect', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);
