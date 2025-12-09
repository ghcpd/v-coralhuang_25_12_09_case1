# Waste Sorter

Simple web app that predicts waste category from an uploaded photo and returns disposal guidance using Hugging Face Inference API and stores history in MongoDB.

Quickstart

1. Copy .env.sample to .env and fill values (HF_API_KEY, MONGO_URI)
2. npm install
3. npm run dev
4. Open http://localhost:3000

API

POST /api/predict
- body: { imageBase64: "data:image/jpeg;base64,..." }
- response: { label, score, guidance }

GET /api/history
- returns recent predictions

Notes
- This scaffold is a starting point for the coding challenge. Improve model output parsing, add user accounts, analytics, accuracy feedback UI, and local rules per region.
