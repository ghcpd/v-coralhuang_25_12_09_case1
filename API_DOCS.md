# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently no authentication required. User identification via `userId` parameter.

## Response Format
All responses return JSON:
```json
{
  "success": true/false,
  "data": {},
  "error": "Error message if failed"
}
```

---

## Classification Endpoints

### Classify Waste Image
Predict the waste category from an uploaded image.

**Endpoint:** `POST /classify/classify`

**Request:**
- Content-Type: `multipart/form-data`
- Parameters:
  - `image` (file, required) - Image file (JPEG, PNG, GIF, WebP, max 10MB)
  - `userId` (string, required) - User identifier

**Response:**
```json
{
  "success": true,
  "prediction": {
    "id": "650a1b2c3d4e5f6g7h8i",
    "category": "plastic",
    "confidence": "92.45",
    "binColor": "yellow",
    "recycled": true,
    "disposalGuidance": "Check recycling code (1-7). Rinse before recycling.",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "error": "Classification failed",
  "message": "No image file provided"
}
```

---

### Submit Prediction Feedback
Mark a prediction as correct or incorrect.

**Endpoint:** `POST /classify/feedback`

**Request:**
```json
{
  "predictionId": "650a1b2c3d4e5f6g7h8i",
  "feedback": "correct"
}
```

**Valid Feedback Values:**
- `"correct"` - Prediction was accurate
- `"incorrect"` - Prediction was wrong

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted",
  "prediction": {
    "id": "650a1b2c3d4e5f6g7h8i",
    "userFeedback": "correct",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

## History Endpoints

### Get User's Prediction History
Retrieve all predictions made by a user.

**Endpoint:** `GET /history/:userId`

**Query Parameters:**
- `limit` (number, default: 50) - Maximum results per page
- `skip` (number, default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "650a1b2c3d4e5f6g7h8i",
      "userId": "user_1234567890",
      "category": "plastic",
      "confidence": 0.9245,
      "binColor": "yellow",
      "recycled": true,
      "disposalGuidance": "Check recycling code...",
      "userFeedback": "correct",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "skip": 0,
    "hasMore": false
  }
}
```

**Example Requests:**
```bash
# Get first 50 predictions
GET /history/user_1234567890

# Get with pagination (10 items, skip first 10)
GET /history/user_1234567890?limit=10&skip=10

# Get recent 5 predictions
GET /history/user_1234567890?limit=5
```

---

### Get Single Prediction
Retrieve details of a specific prediction.

**Endpoint:** `GET /history/prediction/:predictionId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "650a1b2c3d4e5f6g7h8i",
    "userId": "user_1234567890",
    "imageUrl": "/uploads/1705326600000-waste.jpg",
    "originalFileName": "waste.jpg",
    "category": "plastic",
    "confidence": 0.9245,
    "binColor": "yellow",
    "recycled": true,
    "disposalGuidance": "Check recycling code (1-7). Rinse before recycling.",
    "userFeedback": "correct",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Delete Prediction
Remove a prediction from history.

**Endpoint:** `DELETE /history/:predictionId`

**Response:**
```json
{
  "success": true,
  "message": "Prediction deleted"
}
```

---

## Analytics Endpoints

### Get User Analytics
Retrieve comprehensive analytics and impact statistics for a user.

**Endpoint:** `GET /analytics/user/:userId`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalPredictions": 42,
    "accuracy": 94.5,
    "categoryBreakdown": [
      {
        "_id": "plastic",
        "count": 18,
        "avgConfidence": 0.91
      },
      {
        "_id": "paper",
        "count": 15,
        "avgConfidence": 0.88
      },
      {
        "_id": "metal",
        "count": 9,
        "avgConfidence": 0.85
      }
    ],
    "topItems": [
      {
        "_id": "plastic",
        "count": 18,
        "recycled": true
      },
      {
        "_id": "paper",
        "count": 15,
        "recycled": true
      }
    ],
    "dailyImpact": [
      {
        "_id": "2024-01-09",
        "count": 5,
        "recycledCount": 4
      },
      {
        "_id": "2024-01-10",
        "count": 7,
        "recycledCount": 6
      }
    ],
    "weeklyRecyclableItems": 28,
    "recyclablePercentage": "86.67"
  }
}
```

**Response Fields:**
- `totalPredictions` - Total classifications made
- `accuracy` - Percentage of verified correct predictions
- `categoryBreakdown` - Count and confidence by category
- `topItems` - Most frequently predicted categories
- `dailyImpact` - Activity for last 7 days
- `weeklyRecyclableItems` - Recyclable items in past 7 days
- `recyclablePercentage` - Percentage of recyclable items

---

### Get Leaderboard
Get top users by number of predictions.

**Endpoint:** `GET /analytics/leaderboard`

**Query Parameters:**
- `limit` (number, default: 10) - Number of top users to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user_1234567890",
      "totalPredictions": 42,
      "accuracy": "94.50"
    },
    {
      "userId": "user_9876543210",
      "totalPredictions": 38,
      "accuracy": "91.23"
    }
  ]
}
```

---

## Error Codes

### HTTP Status Codes
- `200` - Success
- `400` - Bad request (validation error)
- `404` - Resource not found
- `500` - Server error

### Common Error Responses

**No Image File:**
```json
{
  "error": "No image file provided"
}
```

**Invalid File Type:**
```json
{
  "error": "Only image files are allowed"
}
```

**File Too Large:**
```json
{
  "error": "File size exceeds 10MB limit"
}
```

**User Not Found:**
```json
{
  "error": "User not found"
}
```

**Prediction Not Found:**
```json
{
  "error": "Prediction not found"
}
```

**Classification Failed:**
```json
{
  "error": "Classification failed",
  "message": "Network error or API timeout"
}
```

---

## Waste Categories

| Category | Code | Emoji | Recyclable | Bin | Examples |
|----------|------|-------|-----------|-----|----------|
| Paper | `paper` | 📄 | Yes | Blue | Cardboard, newspaper, magazines |
| Plastic | `plastic` | 🧴 | Yes | Yellow | Bottles, bags, containers |
| Glass | `glass` | 🥤 | Yes | Green | Bottles, jars, windows |
| Metal | `metal` | 🥫 | Yes | Yellow | Cans, foil, wires |
| Organic | `organic` | 🍂 | Compost | Brown | Food, leaves, compost |
| Other | `other` | 🗑️ | No | Black | General trash |

---

## Request Examples

### Using cURL

**Classify Image:**
```bash
curl -X POST http://localhost:5000/api/classify/classify \
  -F "image=@/path/to/image.jpg" \
  -F "userId=user_1234567890"
```

**Get History:**
```bash
curl http://localhost:5000/api/history/user_1234567890
```

**Get Analytics:**
```bash
curl http://localhost:5000/api/analytics/user/user_1234567890
```

**Submit Feedback:**
```bash
curl -X POST http://localhost:5000/api/classify/feedback \
  -H "Content-Type: application/json" \
  -d '{"predictionId":"650a1b2c3d4e5f6g7h8i","feedback":"correct"}'
```

### Using JavaScript Fetch

**Classify Image:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('userId', 'user_1234567890');

const response = await fetch('http://localhost:5000/api/classify/classify', {
  method: 'POST',
  body: formData
});
const data = await response.json();
```

**Get Analytics:**
```javascript
const response = await fetch(
  'http://localhost:5000/api/analytics/user/user_1234567890'
);
const data = await response.json();
```

---

## Rate Limiting

Currently no rate limiting. In production, consider implementing:
- 100 requests per minute per user
- 1000 requests per hour per IP

---

## Versioning

Current API Version: `v1`

Future versions may use: `/api/v2/...`

---

## Support

For API issues:
1. Check error message and HTTP status code
2. Verify all required parameters are provided
3. Ensure MongoDB and Hugging Face API are accessible
4. Check backend logs for detailed error information
