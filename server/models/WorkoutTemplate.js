import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    exercises: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        sets: Number,
        reps: Number,
        weight: Number,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("WorkoutTemplate", templateSchema);
