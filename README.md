# Waste Sorter — web demo

Small demo app that classifies waste items using a pre-trained Hugging Face model and stores results in MongoDB. The app provides a basic UI where users can upload images, see categorizations, history, and simple analytics.

## Features
- Upload or snap a photo (desktop/mobile) and classify it using the Hugging Face inference API
- Save predictions and timestamps in MongoDB (or an in-memory fallback for quick testing)
- Simple analytics: top labels and counts

## Local quick start

1. Install dependencies

```powershell
npm install
```

2. Copy `.env.example` to `.env` and populate environment variables. Example:

```
HF_API_KEY=your_hf_inference_api_token
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.foo.mongodb.net/mydb?retryWrites=true&w=majority
PORT=3000
```

If you don't set `HF_API_KEY`, the server runs in MOCK mode and returns fake predictions. If you don't set `MONGO_URI`, the server uses an in-memory history store (useful for simple testing).

3. Run

```powershell
npm run dev
```

4. Open http://localhost:3000 in a browser and try uploading images.

## Backend endpoints
- GET /api/ping — simple liveness check
- POST /api/classify — (multipart form) field `image` -> classify and save record
- GET /api/history — list saved records
- GET /api/analytics — small analytics summary

## Notes & next steps
- Improve model mapping: map model labels to local disposal rules (recyclable vs non-recyclable and bin color) with localization.
- Add user auth and per-user history.
- Add more robust tests and CI.
