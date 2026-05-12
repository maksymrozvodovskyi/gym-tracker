import express from "express";
import { authenticate, isAdmin } from "../middleware/auth.js";
import User from "../models/User.js";
import Exercise from "../models/Exercise.js";
import Session from "../models/Session.js";

const router = express.Router();

router.get("/users", authenticate, isAdmin, async (req, res) => {
  const users = await User.find().select("-passwordHash -refreshToken");
  res.json(users);
});

router.delete("/users/:id", authenticate, isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Користувача видалено" });
});

router.get("/stats", authenticate, isAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalSessions = await Session.countDocuments();
  const totalExercises = await Exercise.countDocuments();
  res.json({ totalUsers, totalSessions, totalExercises });
});

export default router;
