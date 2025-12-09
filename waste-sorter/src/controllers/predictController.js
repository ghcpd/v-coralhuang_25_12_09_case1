const axios = require('axios');
const { getDb } = require('../db/mongo');

const GUIDANCE = {
  cardboard: { recyclable: true, bin: 'Blue' },
  glass: { recyclable: true, bin: 'Green' },
  metal: { recyclable: true, bin: 'Yellow' },
  paper: { recyclable: true, bin: 'Blue' },
  plastic: { recyclable: true, bin: 'Yellow' },
  trash: { recyclable: false, bin: 'Gray' },
  other: { recyclable: false, bin: 'Gray' }
};

async function callHFModel(base64Image) {
  const model = process.env.HF_MODEL || 'nikhilroxtomar/garbage-classification';
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const headers = {
    Authorization: `Bearer ${process.env.HF_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const body = { inputs: base64Image };

  const resp = await axios.post(url, body, { headers, timeout: 30000 });
  return resp.data;
}

exports.predict = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

    const hfOutput = await callHFModel(imageBase64);

    // hfOutput format varies by model. We'll look for an array of labels/confidences
    let label = 'other';
    let score = 0;

    if (Array.isArray(hfOutput)) {
      if (hfOutput.length > 0) {
        // Some models return [{label,score}, ...]
        const top = hfOutput[0];
        label = (top.label || 'other').toLowerCase();
        score = top.score || 0;
      }
    } else if (hfOutput && hfOutput.labels) {
      label = (hfOutput.labels[0] || 'other').toLowerCase();
      score = hfOutput.scores ? hfOutput.scores[0] : 0;
    }

    const guidance = GUIDANCE[label] || GUIDANCE.other;

    // Save to DB
    const db = await getDb();
    const rec = {
      label,
      score,
      guidance,
      createdAt: new Date()
    };
    await db.collection('history').insertOne(rec);

    res.json({ label, score, guidance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Prediction failed' });
  }
};
