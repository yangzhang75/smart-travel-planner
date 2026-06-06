import { Router } from "express";
import OpenAI from "openai";
import Trip from "../models/Trip.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

let _client;
const getClient = () => (_client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

router.post("/", requireAuth, async (req, res) => {
  try {
    const { where, dateLabel, whoLabel, budgetLabel } = req.body;

    const response = await getClient().responses.create({
      model: "gpt-4o-mini",
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

    const itinerary = JSON.parse(response.output_text);

    const trip = await Trip.create({
      userId: req.userId,
      title: itinerary.title,
      where,
      dateLabel,
      whoLabel,
      budgetLabel,
      days: itinerary.days,
      budget: itinerary.budget,
    });

    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate trip" });
  }
});

export default router;
