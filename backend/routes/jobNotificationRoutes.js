import express from "express";
import { createJobNotification, deleteJobNotification, getAllJobNotifications, updateJobNotification } from "../controllers/jobNotificationController.js";
import protect from "../middleware/authMiddleware.js";
import adminCheck from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getAllJobNotifications);
router.post("/", protect, adminCheck, createJobNotification);
router.put("/:id", protect, adminCheck, updateJobNotification);
router.delete("/:id", protect, adminCheck, deleteJobNotification);

export default router;
