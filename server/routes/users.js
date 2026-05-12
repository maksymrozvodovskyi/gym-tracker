import express from "express";
import { authenticate } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/me", authenticate, async (req, res) => {
  res.json(req.user);
});

router.put("/me", authenticate, async (req, res) => {
  const { name, weight, height, goals } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, weight, height, goals },
    { new: true },
  );
  res.json(user);
});

export default router;
