import express from "express";
import { authenticate } from "../middleware/auth.js";
import Session from "../models/Session.js";
import PersonalRecord from "../models/PersonalRecord.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id })
    .sort({ date: -1 })
    .limit(50);
  res.json(sessions);
});

router.get("/:id", authenticate, async (req, res) => {
  const s = await Session.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate("exercises.exerciseId");
  res.json(s);
});

router.post("/", authenticate, async (req, res) => {
  const session = await Session.create({ ...req.body, userId: req.user._id });
  for (const ex of session.exercises) {
    for (const set of ex.sets) {
      const existing = await PersonalRecord.findOne({
        userId: req.user._id,
        exerciseId: ex.exerciseId,
      });
      if (
        !existing ||
        set.weight > existing.weight ||
        (set.weight === existing.weight && set.reps > existing.reps)
      ) {
        await PersonalRecord.findOneAndUpdate(
          { userId: req.user._id, exerciseId: ex.exerciseId },
          { weight: set.weight, reps: set.reps, date: session.date },
          { upsert: true, new: true },
        );
      }
    }
  }
  res.status(201).json(session);
});

export default router;
