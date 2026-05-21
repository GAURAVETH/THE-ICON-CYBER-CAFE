import express from "express";
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    rateBooking,
    cancelBooking,
    getBookingStats
} from "../controllers/bookingController.js";
import protect from "../middleware/authMiddleware.js";
import adminCheck from "../middleware/adminMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/", protect, createBooking);
router.get("/", protect, getAllBookings);
router.get("/stats/dashboard", protect, getBookingStats);
router.get("/:id", protect, getBookingById);
router.put("/:id/status", protect, adminCheck, updateBookingStatus);
router.put("/:id/rate", protect, rateBooking);
router.put("/:id/cancel", protect, cancelBooking);

export default router;
