import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
console.log(process.env.OPENAI_API_KEY);
const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});