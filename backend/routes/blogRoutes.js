import express from "express";
import { createBlog, deleteBlog, getAllBlogs, updateBlog } from "../controllers/blogController.js";
import protect from "../middleware/authMiddleware.js";
import adminCheck from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.post("/", protect, adminCheck, createBlog);
router.put("/:id", protect, adminCheck, updateBlog);
router.delete("/:id", protect, adminCheck, deleteBlog);

export default router;
