import express from "express";
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addTaskComment,
    getTaskStats
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", protect, createTask);
router.get("/", protect, getAllTasks);
router.get("/stats", protect, getTaskStats);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.put("/:id/status", protect, updateTaskStatus);
router.post("/:id/comments", protect, addTaskComment);

export default router;