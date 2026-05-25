import express from "express";
import {
    createAdvancePayment,
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

router.post("/advance", protect, createAdvancePayment);
router.post("/razorpay", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);

router.get("/", protect, getAllPayments);
router.get("/stats/dashboard", protect, getPaymentStats);
router.get("/:id", protect, getPaymentById);

router.post("/:id/refund", protect, adminCheck, processRefund);

export default router;