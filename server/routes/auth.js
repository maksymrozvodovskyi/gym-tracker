import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import { attachStarterTemplates } from "../seed/defaultCatalog.js";

const router = express.Router();

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const generateTokens = (user) => {
  const id = String(user._id);
  const access = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
  const refresh = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
  return { access, refresh };
};

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Некоректна електронна пошта"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Пароль має містити щонайменше 6 символів"),
    body("name").notEmpty().withMessage("Вкажіть ім’я"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { password, name } = req.body;
    const email = normalizeEmail(req.body.email);
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Ця пошта вже зареєстрована" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash: hash, name });
    await attachStarterTemplates(user._id).catch(() => {});
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refresh;
    await user.save();
    res.json({
      ...tokens,
      user: { id: user._id, email, name, role: user.role },
    });
  },
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Некоректна електронна пошта"),
    body("password").notEmpty().withMessage("Введіть пароль"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res
        .status(401)
        .json({ message: "Невірна пошта або пароль" });
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refresh;
    await user.save();
    res.json({
      ...tokens,
      user: { id: user._id, email, name: user.name, role: user.role },
    });
  },
);

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Не передано токен оновлення" });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) throw new Error();
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refresh;
    await user.save();
    res.json(tokens);
  } catch {
    res.status(401).json({ message: "Недійсний або прострочений токен" });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }
  res.json({ message: "Ви вийшли з акаунта" });
});

export default router;
