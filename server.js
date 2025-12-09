require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { connectDb, getHistoryCollection } = require('./src/db');
const { getGuidance } = require('./src/guidance');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Health
app.get('/api/ping', (req, res) => res.json({ ok: true, time: Date.now() }));

// Classify endpoint - expects multipart/form-data with field 'image'
app.post('/api/classify', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file required (field name: image)' });

    const filepath = req.file.path;
    const useMock = !process.env.HF_API_KEY;

    let result;
    if (useMock) {
      // mock result for local testing
      result = {
        model: 'MOCK',
        predictions: [
          { label: 'plastic', score: 0.84 }
        ]
      };
    } else {
      // send the image bytes to Hugging Face Inference API
      const url = `https://api-inference.huggingface.co/models/nikhilroxtomar/garbage-classification`;
      const input = fs.readFileSync(filepath);
      const resp = await axios.post(url, input, {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 120_000
      });
      result = resp.data;
    }

    // Save into DB (if available)
    const history = getHistoryCollection();
    // attach simple guidance information based on the top label
    const topLabel = Array.isArray(result.predictions) ? result.predictions[0]?.label : undefined;
    const guidance = getGuidance(topLabel);

    const record = {
      imagePath: path.relative(__dirname, filepath),
      result,
      guidance,
      createdAt: new Date(),
      feedback: null // user feedback can be stored here
    };

    if (history) {
      await history.insertOne(record);
    } else {
      // fall back: attach to app.memoryHistory
      app.memoryHistory = app.memoryHistory || [];
      app.memoryHistory.push(record);
    }

    res.json({ ok: true, record });
  } catch (err) {
    console.error('classify error', err?.message || err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// History list
app.get('/api/history', async (req, res) => {
  const history = getHistoryCollection();
  if (history) {
    const docs = await history.find().sort({ createdAt: -1 }).limit(200).toArray();
    return res.json({ ok: true, items: docs });
  }
  return res.json({ ok: true, items: app.memoryHistory || [] });
});

// Simple analytics: top labels and counts
app.get('/api/analytics', async (req, res) => {
  const history = getHistoryCollection();
  let items = [];
  if (history) items = await history.find().toArray();
  else items = app.memoryHistory || [];

  // compute top labels (based on top prediction label per record)
  const counts = {};
  let correct = 0;
  let feedbackCount = 0;
  // daily impact: recyclable items in last 24 hours
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let recyclableCountIn24h = 0;
  for (const it of items) {
    try {
      const top = Array.isArray(it.result.predictions) ? it.result.predictions[0].label : undefined;
      if (top) counts[top] = (counts[top] || 0) + 1;
      // feedback / accuracy metrics
      if (it.feedback && typeof it.feedback.isCorrect === 'boolean') {
        feedbackCount += 1;
        if (it.feedback.isCorrect) correct += 1;
      }
      // recyclable estimation
      const recyclable = Boolean(it.guidance && it.guidance.recyclable);
      if (recyclable && (new Date(it.createdAt)).getTime() >= now - dayMs) recyclableCountIn24h += 1;
    } catch (e) { /* ignore */ }
  }

  const accuracy = feedbackCount ? (correct / feedbackCount) : null;
  const perItemImpactKgCO2 = 0.5; // arbitrary demonstration estimate for saved GHG per recyclable item
  const dailyImpactKgCO2 = recyclableCountIn24h * perItemImpactKgCO2;

  res.json({ ok: true, total: items.length, topLabels: counts, accuracy, feedbackCount, dailyImpactKgCO2 });
});

// Allow users to submit feedback for a historical record: { id, isCorrect, userLabel }
app.post('/api/feedback', async (req, res) => {
  try {
    const { id, isCorrect, userLabel } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });

    const history = getHistoryCollection();
    if (history) {
      const { ObjectId } = require('mongodb');
      const filter = { _id: new ObjectId(id) };
      const update = { $set: { feedback: { isCorrect: !!isCorrect, userLabel: userLabel || null, updatedAt: new Date() } } };
      await history.updateOne(filter, update);
      return res.json({ ok: true });
    }

    // memory store
    app.memoryHistory = app.memoryHistory || [];
    const rec = app.memoryHistory.find(r => String(r._id || r.id) === String(id));
    if (!rec) return res.status(404).json({ error: 'record not found' });
    rec.feedback = { isCorrect: !!isCorrect, userLabel: userLabel || null, updatedAt: new Date() };
    return res.json({ ok: true });
  } catch (err) {
    console.error('feedback error', err?.message || err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// Initialize DB then start server
const PORT = process.env.PORT || 3000;
async function boot() {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('DB connect failed, running with memory store -', err?.message || err);
    // still start
    app.listen(PORT, () => console.log(`Server listening on port ${PORT} (memory-store)`));
  }
}

boot();

module.exports = app;
