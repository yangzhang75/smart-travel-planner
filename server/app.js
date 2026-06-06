import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trips.js";
import planRoutes from "./routes/plan.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/plan-trip", planRoutes);

export default app;
