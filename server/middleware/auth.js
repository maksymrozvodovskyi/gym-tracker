import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Потрібен токен доступу" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");
    if (!req.user)
      return res.status(401).json({ message: "Користувача не знайдено" });
    next();
  } catch {
    return res.status(401).json({ message: "Недійсний або прострочений токен" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Доступ лише для адміністратора" });
  next();
};
