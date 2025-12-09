# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure MongoDB & Hugging Face

**MongoDB Setup (Choose One):**
- **Local**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Cloud**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

**Hugging Face**:
1. Sign up at https://huggingface.co/
2. Get API key from account settings
3. Copy to `backend/.env`

### 3. Create .env File
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and Hugging Face API key
```

### 4. Start Application
```bash
npm run dev
```

### 5. Open Browser
- Frontend: http://localhost:8080
- API: http://localhost:5000/api

## File Structure Quick Reference

```
📁 frontend/ → HTML, CSS, JS (client-side)
📁 backend/ → Express server (API)
  📁 models/ → Database schemas
  📁 controllers/ → Business logic
  📁 routes/ → API endpoints
📁 uploads/ → Temporary image storage
```

## API Quick Reference

```bash
# Classify image
POST /api/classify/classify
Body: FormData { image, userId }

# Get history
GET /api/history/{userId}

# Get analytics
GET /api/analytics/user/{userId}

# Submit feedback
POST /api/classify/feedback
Body: { predictionId, feedback }
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/waste-sorting
PORT=5000
HUGGING_FACE_API_KEY=your_key_here
HUGGING_FACE_MODEL=nikhilroxtomar/garbage-classification
NODE_ENV=development
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check MongoDB is running: `mongod` |
| Classification timeout | Verify Hugging Face API key is valid |
| Port 8080 in use | Change frontend port in `app.js` |
| CORS error | Ensure backend is running on port 5000 |

## Next Steps

1. ✅ Test image upload
2. ✅ Check prediction accuracy
3. ✅ Review history and analytics
4. ✅ Deploy to production

See `README.md` for complete documentation.
