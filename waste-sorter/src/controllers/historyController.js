const { getDb } = require('../db/mongo');

exports.list = async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.collection('history').find({}).sort({ createdAt: -1 }).limit(100).toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch history' });
  }
};
