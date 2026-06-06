import { Router } from "express";
import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/", async (req, res) => {
  const trips = await Trip.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(trips);
});

router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  res.json(trip);
});

router.post("/", async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, userId: req.userId });
    res.status(201).json(trip);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create trip" });
  }
});

router.put("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const { userId, ...updates } = req.body;
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!trip) return res.status(404).json({ error: "Trip not found" });
  res.json(trip);
});

router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const result = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!result) return res.status(404).json({ error: "Trip not found" });
  res.json({ ok: true });
});

export default router;
