import express from "express";
import {
    createRazorpayOrder,
    verifyPayment,
    getAllPayments,
    getPaymentById,
    processRefund,
    getPaymentStats
} from "../controllers/paymentController.js";
import protect from "../middleware/authMiddleware.js";
import adminCheck from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.post("/razorpay", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);

// Protected routes
router.get("/", protect, getAllPayments);
router.get("/stats/dashboard", protect, getPaymentStats);
router.get("/:id", protect, getPaymentById);

// Admin routes
router.post("/:id/refund", protect, adminCheck, processRefund);

export default router;