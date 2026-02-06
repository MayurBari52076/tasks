import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createInvite,
  acceptInvite
} from "../controllers/inviteController.js";

const router = express.Router();

router.post("/:taskId", protect, createInvite);
router.post("/accept/:token", acceptInvite);

export default router;
