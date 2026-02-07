import Invite from "../models/Invite.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import crypto from "crypto";

export const createInvite = async (req, res) => {
  const { email } = req.body;
  const task = await Task.findById(req.params.taskId);

  if (!task) return res.status(404).json("Task not found");

  if (!task.owner.equals(req.user.id))
    return res.status(403).json("Only owner can invite");

  const existing = await Invite.findOne({
    taskId: task._id,
    email
  });

  if (existing) return res.status(400).json("Invite already sent");

  const token = crypto.randomBytes(20).toString("hex");

  await Invite.create({
    taskId: task._id,
    email,
    token,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24
  });

  res.json({
  message: "Invite created",
  link: `${process.env.CLIENT_URL}/accept-invite/${token}`
  });

};

export const acceptInvite = async (req, res) => {
  const invite = await Invite.findOne({ token: req.params.token });
  if (!invite) return res.status(400).json("Invalid invite");

  if (invite.expiresAt < Date.now())
    return res.status(400).json("Invite expired");

  const user = await User.findOne({ email: invite.email });
  if (!user) return res.status(400).json("User not registered");

  const task = await Task.findById(invite.taskId);
  if (!task) return res.status(404).json("Task not found");

  if (!task.collaborators.includes(user._id)) {
    task.collaborators.push(user._id);
    await task.save();
  }

  await invite.deleteOne();
  res.json("You are now collaborator");
};
