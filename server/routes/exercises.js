import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import Exercise from "../models/Exercise.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const { search, muscleGroup } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (muscleGroup) filter.muscleGroup = muscleGroup;
  const exercises = await Exercise.find(filter);
  res.json(exercises);
});

router.post("/", authenticate, isAdmin, async (req, res) => {
  const ex = await Exercise.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(ex);
});

router.put("/:id", authenticate, isAdmin, async (req, res) => {
  const ex = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(ex);
});

router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  await Exercise.findByIdAndDelete(req.params.id);
  res.json({ message: "Видалено" });
});

export default router;
