const { MongoClient } = require('mongodb');

let client = null;
let historyCollection = null;

async function connectDb(uri) {
  if (!uri) throw new Error('MONGO_URI is not set');
  client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  historyCollection = db.collection('predictions_history');
  // create indexes for reasonable queries
  await historyCollection.createIndex({ createdAt: -1 });
  return { client, historyCollection };
}

function getHistoryCollection() {
  return historyCollection;
}

module.exports = { connectDb, getHistoryCollection };
