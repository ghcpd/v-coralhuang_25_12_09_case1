# Waste Sorter App (minimal)

A simple web app to classify waste images and provide disposal guidance. Uses Hugging Face Inference API for image classification and MongoDB to persist predictions.

Quick start

1. Copy .env.example to .env and set values.
2. npm install
3. npm run dev
4. Open http://localhost:3000

Environment variables

- PORT
- MONGODB_URI
- HUGGINGFACE_API_KEY
- HF_MODEL (optional)

Notes

- If HUGGINGFACE_API_KEY is not set, the server will respond with a mock classification so you can test the UI offline.
- Basic analytics endpoints are available at /api/analytics

Docker

- Build and run with docker-compose: docker-compose up --build
- The app will be available on http://localhost:3000 and will connect to a MongoDB container (no local DB required).
