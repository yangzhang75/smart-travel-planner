# Gp09_gpmembers: Emily Sun, Yoyo Lai, Wendy Wu, Yang Zhang
# Smart Travel Planner / Voyage.ai
We are group09-Smart Travel Planner doing an website called Voyage.ai which is a smart travel planning web app prototype. Users can enter trip details such as destination, dates, travelers, and budget. The React frontend sends the trip request to a Node.js/Express backend, and the backend returns a sample itinerary.

## Features
- Homepage with project introduction
- Create Trip form using React state
- Node.js REST API backend
- Sample itinerary generation
- Saved trips display
- Budget, weather, and map summary sections

### Tech Stack
- React
- Vite
- JavaScript
- Node.js
- Express
- CSS

### How to Run

Add your OpenAI API key to **`server/.env`**:

```
OPENAI_API_KEY=sk-your-key-here
```

Get a key at https://platform.openai.com/api-keys

Open two terminals.

##### Terminal 1: backend
```bash
cd server
npm install
node server.js
```
Backend runs at: http://localhost:5001

##### Terminal 2: frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

### API Routes
- GET `/api/trips` returns saved sample trips
- POST `/api/trips` creates a new sample trip itinerary

### Notes
The AI itinerary is simulated with sample data. This prototype focuses on React components, user input, REST API communication, and Node.js backend structure.
