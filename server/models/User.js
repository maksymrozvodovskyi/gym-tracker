import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    weight: Number,
    height: Number,
    goals: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refreshToken: String,
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
