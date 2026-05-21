import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) {
  console.error(
    "Missing OPENAI_API_KEY. Add your key to server/.env:\n" +
      '  OPENAI_API_KEY=sk-your-key-here'
  );
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey });

app.post("/api/plan-trip", async (req, res) => {
  try {
    const { where, dateLabel, whoLabel, budgetLabel } = req.body;

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: `
Create a travel itinerary as JSON only.

Trip:
Destination: ${where}
Dates: ${dateLabel}
Travelers: ${whoLabel}
Budget: ${budgetLabel}

Return this exact JSON shape:
{
  "title": "Tokyo Adventure",
  "days": [
    {
      "day": "Day 1",
      "date": "Sat, Jul 12",
      "theme": "Arrival & Shibuya",
      "stops": [
        {
          "time": "9:00",
          "title": "Tsukiji Outer Market",
          "type": "Food & Market · Chuo",
          "description": "Short description",
          "duration": "2 hrs",
          "cost": "$20"
        }
      ]
    }
  ],
  "budget": {
    "total": "$1500",
    "dayOneTotal": "$120",
    "remaining": "$1380"
  }
}
`,
    });

    const text = response.output_text;
    const json = JSON.parse(text);

    res.json(json);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate trip" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});