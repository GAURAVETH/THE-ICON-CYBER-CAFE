import express from "express";
import {
    getDashboardStats,
    getAllUsers,
    updateUser,
    deleteUser,
    deactivateUser,
    getAllPayments,
    getRevenueAnalytics,
    getBookingAnalytics,
    assignWorkerToBooking
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import adminCheck from "../middleware/adminMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(protect);
router.use(adminCheck);

// Dashboard & Statistics
router.get("/dashboard", getDashboardStats);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/analytics/bookings", getBookingAnalytics);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/deactivate", deactivateUser);

// Payment Management
router.get("/payments", getAllPayments);

// Booking Management
router.put("/bookings/:id/assign-worker", assignWorkerToBooking);

export default router;