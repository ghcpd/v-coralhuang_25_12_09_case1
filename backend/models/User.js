const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalPredictions: {
    type: Number,
    default: 0
  },
  correctPredictions: {
    type: Number,
    default: 0
  },
  settings: {
    localRules: String,
    defaultBinLocation: String
  }
});

module.exports = mongoose.model('User', userSchema);
