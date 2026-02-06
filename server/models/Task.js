import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
