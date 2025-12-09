# Waste Classifier Web App

A web application that helps users sort waste correctly by classifying uploaded or captured images using AI.

## Features

- Upload or capture photos of waste items
- AI-powered classification into categories: cardboard, glass, metal, paper, plastic, trash
- Disposal guidance: recyclable/non-recyclable and bin color
- User history tracking
- Simple analytics: top items, accuracy feedback

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6), Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI**: Hugging Face Inference API (nikhilroxtomar/garbage-classification model)

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB**:
   - Install MongoDB locally or use a cloud service like MongoDB Atlas
   - Update `MONGODB_URI` in `.env` with your connection string

3. **Get Hugging Face API Key**:
   - Sign up at [Hugging Face](https://huggingface.co)
   - Get an API token from your settings
   - Add it to `.env` as `HUGGINGFACE_API_KEY`

4. **Run the App**:
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser

## Usage

- Upload an image or use the camera to capture one
- Click "Classify" to get the prediction
- View disposal guidance
- Provide feedback on accuracy
- Check history and analytics in the tabs

## API Endpoints

- `POST /api/classify`: Classify an image
- `GET /api/history`: Get classification history
- `PUT /api/feedback/:id`: Update feedback for a prediction
- `GET /api/analytics`: Get analytics data

## Datasets Mentioned

- **TrashNet**: Classic dataset with 6 classes (~2,527 images)
- **TACO**: Trash Annotations in Context for litter detection

## License

ISC