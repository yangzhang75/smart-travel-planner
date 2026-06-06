import { Router } from "express";
import OpenAI from "openai";
import Trip from "../models/Trip.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

let _client;
const getClient = () => (_client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

const MODEL = process.env.OPENAI_MODEL || "gpt-5.2";

const SYSTEM_PROMPT =
  "You are a travel itinerary generator. You must respond with a single valid JSON object only — no prose, no markdown fences, no commentary.";

const userPrompt = ({ where, dateLabel, whoLabel, budgetLabel }) => `
Create a travel itinerary as JSON.

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
}`;

router.post("/", requireAuth, async (req, res) => {
  const { where, dateLabel, whoLabel, budgetLabel } = req.body;
  let rawText;

  try {
    console.log(`[plan-trip] model=${MODEL}  where="${where}"  dates="${dateLabel}"`);

    const response = await getClient().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt({ where, dateLabel, whoLabel, budgetLabel }) },
      ],
    });

    rawText = response.choices?.[0]?.message?.content ?? "";

    let itinerary;
    try {
      itinerary = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("[plan-trip] JSON.parse failed");
      console.error("  parse error:", parseErr.message);
      console.error("  raw text (first 500 chars):", rawText.slice(0, 500));
      return res.status(500).json({
        error: "AI returned unparseable JSON",
        details: parseErr.message,
        rawTextPreview: rawText.slice(0, 500),
      });
    }

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

    console.log(`[plan-trip] saved trip ${trip._id} for user ${req.userId}`);
    res.json(trip);
  } catch (error) {
    console.error("[plan-trip] OpenAI / handler error:");
    console.error("  name:    ", error?.name);
    console.error("  message: ", error?.message);
    console.error("  status:  ", error?.status);
    console.error("  code:    ", error?.code);
    console.error("  type:    ", error?.type);
    if (error?.response?.data) {
      console.error("  response.data:", JSON.stringify(error.response.data));
    }
    if (rawText) console.error("  rawText (first 500 chars):", rawText.slice(0, 500));
    if (error?.stack) console.error(error.stack);

    res.status(500).json({
      error: error?.message || "Failed to generate trip",
      details: {
        name: error?.name,
        status: error?.status,
        code: error?.code,
        type: error?.type,
      },
    });
  }
});

export default router;
