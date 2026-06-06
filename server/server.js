import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trips.js";
import planRoutes from "./routes/plan.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const required = ["OPENAI_API_KEY", "MONGO_URI", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}\nSet them in server/.env`);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/plan-trip", planRoutes);

const PORT = process.env.PORT || 5001;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
    process.exit(1);
  });
