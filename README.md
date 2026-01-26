# Waste Sort - Smart Waste Classification Web App

A smart web application that helps users sort waste correctly by classifying items through image recognition, providing disposal guidance, and tracking environmental impact.

## Features

✨ **Image Classification** - Upload or snap a photo of waste items for instant categorization
📊 **History Tracking** - Save all predictions with timestamps and confidence scores
♻️ **Disposal Guidance** - Get local bin color and recyclability status for each item
📈 **Analytics Dashboard** - View personal impact with category breakdown and daily activity
✅ **Accuracy Feedback** - Submit corrections to improve classification accuracy
🌍 **Environmental Impact** - Track your contribution to waste reduction

## Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript (ES6)** - Core web technologies
- **Axios/Fetch API** - HTTP requests to backend
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js + Express.js** - RESTful API server
- **MongoDB** - NoSQL database for history and analytics
- **Multer** - File upload handling
- **Express Validator** - Input validation

### Machine Learning
- **Hugging Face Inference API** - Pre-trained waste classification model
- **Model**: `nikhilroxtomar/garbage-classification`
- **Classes**: cardboard, glass, metal, paper, plastic, trash

## Project Structure

```
waste-sorting-app/
├── frontend/
│   ├── index.html          # Main HTML structure
│   ├── styles.css          # Responsive styling
│   ├── app.js              # Frontend logic
│   └── package.json        # Frontend dependencies
│
├── backend/
│   ├── server.js           # Express app setup
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   │
│   ├── models/
│   │   ├── Prediction.js   # MongoDB schema for predictions
│   │   └── User.js         # MongoDB schema for users
│   │
│   ├── controllers/
│   │   ├── classificationController.js  # ML prediction logic
│   │   ├── historyController.js         # History management
│   │   └── analyticsController.js       # Analytics computations
│   │
│   ├── routes/
│   │   ├── classification.js   # Classification endpoints
│   │   ├── history.js          # History endpoints
│   │   └── analytics.js        # Analytics endpoints
│   │
│   └── uploads/            # Temporary storage for images
│
├── package.json            # Root package configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)
- Hugging Face API key

### 1. Clone Repository
```bash
git clone <repository-url>
cd waste-sorting-app
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Configure Environment Variables

Create `backend/.env` from the template:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/waste-sorting
PORT=5000
HUGGING_FACE_API_KEY=your_api_key_here
HUGGING_FACE_MODEL=nikhilroxtomar/garbage-classification
NODE_ENV=development
```

### 4. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get connection string
3. Update `MONGODB_URI` in `.env`

### 5. Get Hugging Face API Key
1. Sign up at [Hugging Face](https://huggingface.co)
2. Generate API token from account settings
3. Add to `backend/.env` as `HUGGING_FACE_API_KEY`

### 6. Start the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Backend Only:**
```bash
npm run backend:dev
```

**Frontend Only:**
```bash
npm run frontend
```

### 7. Access the App
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`

## API Endpoints

### Classification
- **POST** `/api/classify/classify` - Classify waste image
  - Request: FormData with `image` file and `userId`
  - Response: Prediction with category, confidence, bin color, guidance

- **POST** `/api/classify/feedback` - Submit feedback on prediction
  - Body: `{ predictionId, feedback: "correct" | "incorrect" }`

### History
- **GET** `/api/history/:userId` - Get user's prediction history
  - Query params: `limit` (default 50), `skip` (default 0)

- **GET** `/api/history/prediction/:predictionId` - Get single prediction details

- **DELETE** `/api/history/:predictionId` - Delete a prediction

### Analytics
- **GET** `/api/analytics/user/:userId` - Get user analytics and impact stats

- **GET** `/api/analytics/leaderboard` - Get top users by predictions
  - Query params: `limit` (default 10)

## Usage Guide

### 1. Upload an Image
- Click the upload box or drag-and-drop
- Select image from your device (JPEG, PNG, GIF, WebP - max 10MB)
- Image is previewed before classification

### 2. Classify
- Click "Classify Waste" button
- Wait for AI analysis (2-5 seconds)
- See prediction with confidence score

### 3. View Results
- Category with emoji badge
- Confidence percentage
- Bin color indicator
- Disposal guidance text
- Recyclability status

### 4. Provide Feedback
- Mark prediction as "Correct" or "Incorrect"
- Helps improve accuracy for future predictions

### 5. Check History
- View all past predictions
- See timestamps and confidence scores
- Review disposal guidance again

### 6. Analyze Impact
- Total predictions made
- Accuracy percentage
- Category breakdown
- Daily activity (7 days)
- Weekly recyclable items count

## Waste Categories

| Category | Emoji | Recyclable | Bin Color | Examples |
|----------|-------|-----------|-----------|----------|
| Paper | 📄 | Yes | Blue | Cardboard, newspapers, magazines |
| Plastic | 🧴 | Yes | Yellow | Bottles, bags, containers |
| Glass | 🥤 | Yes | Green | Bottles, jars |
| Metal | 🥫 | Yes | Yellow | Cans, foil, wires |
| Organic | 🍂 | Compost | Brown | Food, leaves, plant matter |
| Other | 🗑️ | No | Black | General trash |

## Environment Variables Reference

```env
# Database
MONGODB_URI=mongodb://localhost:27017/waste-sorting

# Server
PORT=5000
NODE_ENV=development

# Hugging Face ML
HUGGING_FACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx
HUGGING_FACE_MODEL=nikhilroxtomar/garbage-classification
```

## Database Schema

### Prediction Document
```javascript
{
  userId: String,           // User identifier
  imageUrl: String,         // Path to uploaded image
  originalFileName: String, // Original file name
  category: String,         // Classified category
  confidence: Number,       // 0-1 confidence score
  binColor: String,        // Assigned bin color
  recycled: Boolean,       // Recyclability status
  disposalGuidance: String,// Disposal instructions
  userFeedback: String,    // "correct", "incorrect", or null
  createdAt: Date          // Prediction timestamp
}
```

### User Document
```javascript
{
  userId: String,          // Unique user ID
  email: String,          // User email
  createdAt: Date,        // Account creation date
  totalPredictions: Number,// Total classifications
  correctPredictions: Number,// Verified correct predictions
  settings: {
    localRules: String,   // Local recycling rules
    defaultBinLocation: String
  }
}
```

## Deployment

### Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection
   heroku config:set HUGGING_FACE_API_KEY=your_api_key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Docker Deployment

Create `Dockerfile` and `docker-compose.yml` for containerized deployment.

## Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`
- Check firewall rules for MongoDB Atlas

### Classification Timeout
- Check Hugging Face API key is valid
- Verify internet connection
- Check API rate limits (free tier: 30,000 inferences/month)

### CORS Issues
- Ensure frontend is on `http://localhost:8080`
- Verify CORS middleware is enabled in Express

### Image Upload Fails
- Check file size (max 10MB)
- Verify file format (JPEG, PNG, GIF, WebP)
- Check `uploads/` directory exists

## Performance Tips

1. **Image Optimization** - Compress images before upload for faster processing
2. **Database Indexes** - MongoDB indexes on `userId` and `createdAt` for fast queries
3. **Caching** - Consider adding Redis for leaderboard caching
4. **Batch Processing** - For bulk predictions, implement queue system

## Security Considerations

- [ ] Validate all file uploads with MIME type checking
- [ ] Implement rate limiting on API endpoints
- [ ] Add authentication (JWT tokens)
- [ ] Hash sensitive user data
- [ ] Use HTTPS in production
- [ ] Implement input sanitization
- [ ] Add request validation with express-validator

## Future Enhancements

- 🔐 User authentication and accounts
- 🎯 Advanced search and filtering in history
- 📱 Mobile app (React Native/Flutter)
- 🌍 Location-based bin information
- 🏆 Gamification (badges, streaks, challenges)
- 🤖 Custom model training with user feedback
- 📡 Real-time collaboration features
- 🎨 Dark mode support

## Training Custom Model (Optional)

Use TrashNet or TACO datasets to train your own model:

1. **TrashNet Dataset** - 6 classes, ~2,527 images
   - Link: [TrashNet GitHub](https://github.com/garythung/trashnet)
   - Classes: cardboard, glass, metal, paper, plastic, trash

2. **TACO Dataset** - Litter detection with segmentation
   - Link: [TACO Dataset](http://tacodataset.org/)
   - Classes: 60+ litter types with masks

3. **Training Framework** - Use PyTorch or TensorFlow

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review error logs in backend console

## References

**Research Papers:**
- "Classification of Trash for Recyclability Status" — TrashNet CS229
- "TACO: Trash Annotations in Context" — Mask R-CNN baselines
- "Smart Trash Net" — Faster R-CNN approach
- "DeepWaste" — Deep learning for waste management

**Datasets:**
- TrashNet: ~2,527 images, 6 classes
- TACO: Large-scale trash annotations

**Models:**
- Hugging Face: `nikhilroxtomar/garbage-classification`
- PyTorch/TensorFlow pre-trained models

---

**Built with ❤️ for a cleaner planet**
