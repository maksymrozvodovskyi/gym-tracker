import express from "express";
import { authenticate } from "../middleware/auth.js";
import WorkoutTemplate from "../models/WorkoutTemplate.js";
import { attachStarterTemplates } from "../seed/defaultCatalog.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const templates = await WorkoutTemplate.find({
    userId: req.user._id,
  }).populate("exercises.exerciseId");
  res.json(templates);
});

router.post("/bootstrap", authenticate, async (req, res) => {
  const n0 = await WorkoutTemplate.countDocuments({ userId: req.user._id });
  const loadList = () =>
    WorkoutTemplate.find({ userId: req.user._id }).populate(
      "exercises.exerciseId",
    );
  if (n0 > 0) return res.json(await loadList());
  const ok = await attachStarterTemplates(req.user._id);
  if (!ok)
    return res.status(400).json({
      message:
        "Не вдалося створити шаблони. Переконайтеся, що в каталозі є базові вправи.",
    });
  res.status(201).json(await loadList());
});

router.post("/", authenticate, async (req, res) => {
  const t = await WorkoutTemplate.create({ ...req.body, userId: req.user._id });
  res.status(201).json(t);
});

router.put("/:id", authenticate, async (req, res) => {
  const t = await WorkoutTemplate.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true },
  );
  res.json(t);
});

router.delete("/:id", authenticate, async (req, res) => {
  await WorkoutTemplate.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  res.json({ message: "Видалено" });
});

export default router;
