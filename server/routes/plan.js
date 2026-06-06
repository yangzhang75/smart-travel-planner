import { Router } from "express";
import OpenAI from "openai";
import Trip from "../models/Trip.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

let _client;
const getClient = () => (_client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

const MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const MAX_DAYS = 14;

function computeNumDays({ dateStart, dateEnd, dateLabel }) {
  // Prefer ISO dates from the client (most reliable)
  if (dateStart && dateEnd) {
    const s = new Date(dateStart);
    const e = new Date(dateEnd);
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      const days = Math.round((e - s) / 86400000) + 1;
      return Math.min(MAX_DAYS, Math.max(1, days));
    }
  }
  // Fallback: parse dateLabel like "Jul 12 – Jul 19"
  if (typeof dateLabel === "string") {
    const parts = dateLabel.split(/–|—|-|to/i).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 2) {
      const y = new Date().getFullYear();
      const s = new Date(`${parts[0]}, ${y}`);
      const e = new Date(`${parts[1]}, ${y}`);
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        const days = Math.round((e - s) / 86400000) + 1;
        return Math.min(MAX_DAYS, Math.max(1, days));
      }
    }
  }
  return 3; // sensible default when nothing parseable
}

const SYSTEM_PROMPT =
  "You are a travel itinerary generator. Respond with a single valid JSON object only — no prose, no markdown fences, no commentary. All values must be specific to the user-provided destination; never reuse names of attractions from cities the user did not ask about.";

const userPrompt = ({ where, dateLabel, whoLabel, budgetLabel, numDays }) => `
Generate a travel itinerary as JSON for the trip below.

DESTINATION: ${where}
DATES: ${dateLabel}
TRAVELERS: ${whoLabel}
BUDGET: ${budgetLabel}
DAYS: ${numDays}

Requirements:
- Generate EXACTLY ${numDays} day objects in the "days" array — one per day, in order Day 1 through Day ${numDays}. Do NOT return more, do NOT return fewer.
- The title MUST reflect the destination "${where}" (e.g. "Paris in Bloom", "Bali Beach & Temples"). Do NOT use Tokyo unless the destination IS Tokyo.
- Every "title" inside stops must be a REAL place in or near ${where}.
- Every "type" should be "<Category> · <Real neighborhood in ${where}>".
- Spread costs across all ${numDays} days to roughly fit within ${budgetLabel}.
- Use the dates in ${dateLabel} for the "date" fields (format like "Sat, Jul 12"), advancing one day per day object.

Schema (these are TYPE descriptions, not literal values — replace with real content for ${where}):
{
  "title": "<string: catchy 2–5 word title referencing ${where}>",
  "days": [   // length MUST equal ${numDays}
    {
      "day": "<string: 'Day 1', 'Day 2', ...>",
      "date": "<string: weekday + month + day, e.g. 'Sat, Jul 12'>",
      "theme": "<string: theme for this day in ${where}>",
      "stops": [
        {
          "time": "<string: HH:MM 24h, e.g. '9:00'>",
          "title": "<string: real attraction in ${where}>",
          "type": "<string: '<Category> · <Real neighborhood>'>",
          "description": "<string: 1–2 sentence description>",
          "duration": "<string: e.g. '2 hrs'>",
          "cost": "<string: e.g. '$20' or 'Free'>"
        }
      ]
    }
  ],
  "budget": {
    "total": "<string: total budget like '$1500'>",
    "dayOneTotal": "<string: estimated total for day 1>",
    "remaining": "<string: total minus dayOneTotal>"
  }
}`;

router.post("/", requireAuth, async (req, res) => {
  const { where, dateLabel, whoLabel, budgetLabel, dateStart, dateEnd } = req.body;
  const numDays = computeNumDays({ dateStart, dateEnd, dateLabel });
  let rawText;

  try {
    console.log(`[plan-trip] model=${MODEL}  where="${where}"  dates="${dateLabel}"  numDays=${numDays}`);

    const response = await getClient().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt({ where, dateLabel, whoLabel, budgetLabel, numDays }) },
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
