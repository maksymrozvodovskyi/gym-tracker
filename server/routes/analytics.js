import express from "express";
import { authenticate } from "../middleware/auth.js";
import Session from "../models/Session.js";
import PersonalRecord from "../models/PersonalRecord.js";

const router = express.Router();

router.get("/volume", authenticate, async (req, res) => {
  const { start, end } = req.query;
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  const match = {
    userId: req.user._id,
    date: { $gte: new Date(start), $lte: endDate },
  };
  const sessions = await Session.find(match);
  let total = 0;
  sessions.forEach((s) =>
    s.exercises.forEach((e) =>
      e.sets.forEach((set) => {
        total += (set.weight || 0) * (set.reps || 0);
      }),
    ),
  );
  res.json({ totalVolume: total });
});

router.get("/records", authenticate, async (req, res) => {
  const records = await PersonalRecord.find({ userId: req.user._id }).populate(
    "exerciseId",
  );
  res.json(records);
});

router.get("/history", authenticate, async (req, res) => {
  const { exerciseId, start, end } = req.query;
  const filter = { userId: req.user._id };
  if (exerciseId) filter["exercises.exerciseId"] = exerciseId;
  if (start && end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    filter.date = { $gte: new Date(start), $lte: endDate };
  }
  const sessions = await Session.find(filter).sort({ date: 1 });
  res.json(sessions);
});

export default router;
