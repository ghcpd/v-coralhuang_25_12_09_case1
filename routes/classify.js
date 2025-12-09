const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const Prediction = require('../models/Prediction');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL = process.env.HF_MODEL || 'nikhilroxtomar/garbage-classification';

const LABEL_GUIDANCE = {
  paper: { guidance: 'Recyclable — blue/yellow bin depending on local rules', bin: 'blue' },
  cardboard: { guidance: 'Recyclable — blue bin', bin: 'blue' },
  glass: { guidance: 'Recyclable — green/clear glass bin', bin: 'green' },
  metal: { guidance: 'Recyclable — metal bin or mixed recycling', bin: 'blue' },
  plastic: { guidance: 'Check local rules — many plastics are recyclable', bin: 'blue' },
  organic: { guidance: 'Compostable — brown/green organic bin', bin: 'brown' },
  trash: { guidance: 'Not recyclable — general waste', bin: 'black' },
  other: { guidance: 'Unknown — check local rules', bin: 'black' }
};

function mapLabel(label) {
  const l = label.toLowerCase();
  if (l.includes('paper') || l.includes('cardboard')) return 'paper';
  if (l.includes('glass')) return 'glass';
  if (l.includes('metal')) return 'metal';
  if (l.includes('plastic')) return 'plastic';
  if (l.includes('organic') || l.includes('food')) return 'organic';
  if (l.includes('trash') || l.includes('garbage')) return 'trash';
  return 'other';
}

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  if (!HF_API_KEY) {
    // If no HF key, return a dummy response so UI can be tested offline
    const mock = { label: 'plastic', score: 0.87 };
    const guidance = LABEL_GUIDANCE[mock.label] || LABEL_GUIDANCE.other;
    const doc = await savePrediction(req.file.originalname, mock.label, mock.score, guidance.guidance);
    return res.json({ label: mock.label, score: mock.score, guidance: guidance.guidance, id: doc ? doc._id : null });
  }

  try {
    const url = `https://api-inference.huggingface.co/models/${HF_MODEL}`;
    const resp = await axios.post(url, req.file.buffer, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/octet-stream'
      },
      timeout: 60000
    });

    // HF image-classification returns an array of {label, score}
    const top = Array.isArray(resp.data) ? resp.data[0] : null;
    const rawLabel = top ? top.label : 'other';
    const score = top ? top.score : 0;
    const label = mapLabel(rawLabel);
    const guidance = LABEL_GUIDANCE[label] || LABEL_GUIDANCE.other;

    const doc = await savePrediction(req.file.originalname, label, score, guidance.guidance);

    res.json({ label, score, guidance: guidance.guidance, id: doc ? doc._id : null, rawLabel, rawResponse: resp.data });
  } catch (err) {
    console.error('Classification error:', err.message);
    res.status(500).json({ error: 'Inference failed', details: err.message });
  }
});

async function savePrediction(filename, label, score, guidance) {
  try {
    if (!process.env.MONGODB_URI) return null;
    const doc = new Prediction({ filename, label, score, guidance });
    await doc.save();
    return doc;
  } catch (err) {
    console.error('Failed to save prediction:', err.message);
    return null;
  }
}

module.exports = router;
