import express from "express";
import {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getServiceStats
} from "../controllers/serviceController.js";
import protect from "../middleware/authMiddleware.js";
import adminCheck from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllServices);
router.get("/stats/dashboard", protect, adminCheck, getServiceStats);
router.get("/:id", getServiceById);

// Protected/Admin routes
router.post("/", protect, adminCheck, createService);
router.put("/:id", protect, adminCheck, updateService);
router.delete("/:id", protect, adminCheck, deleteService);

export default router;
