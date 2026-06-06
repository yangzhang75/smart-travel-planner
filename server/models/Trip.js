import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    time: String,
    title: String,
    type: String,
    description: String,
    duration: String,
    cost: String,
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    day: String,
    date: String,
    theme: String,
    stops: [stopSchema],
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    where: String,
    dateLabel: String,
    whoLabel: String,
    budgetLabel: String,
    days: [daySchema],
    budget: {
      total: String,
      dayOneTotal: String,
      remaining: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
