require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const classifyRouter = require('./routes/classify');
const historyRouter = require('./routes/history');
const analyticsRouter = require('./routes/analytics');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');
    } else {
      console.warn('MONGODB_URI not set. History will not be persisted.');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }

  app.use('/api/classify', classifyRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/analytics', analyticsRouter);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  return server;
}

// Start server only when run directly; export start and app for tests
if (require.main === module) {
  start();
} else {
  module.exports = { app, start };
}
