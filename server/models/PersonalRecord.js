import mongoose from "mongoose";

const prSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

prSchema.index({ userId: 1, exerciseId: 1 });

export default mongoose.model("PersonalRecord", prSchema);
