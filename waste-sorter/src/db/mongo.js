const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function getClient(){
  if (client) return client;
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/waste_sorter';
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

async function getDb(){
  if (db) return db;
  const c = await getClient();
  db = c.db();
  return db;
}

module.exports = { getClient, getDb };
