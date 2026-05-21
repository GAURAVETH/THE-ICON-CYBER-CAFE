import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
