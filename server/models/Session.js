import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutTemplate",
    },
    date: { type: Date, default: Date.now },
    duration: Number,
    exercises: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        sets: [
          {
            weight: Number,
            reps: Number,
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
