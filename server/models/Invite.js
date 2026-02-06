import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },
  email: String,
  token: String,
  expiresAt: Date
});

export default mongoose.model("Invite", inviteSchema);
