import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addSubtask,
  toggleSubtask
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

router.post("/:id/subtasks", protect, addSubtask);
router.put("/:id/subtasks/:subId", protect, toggleSubtask);

export default router;
