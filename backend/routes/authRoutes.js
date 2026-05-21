import express from "express";
import {
    registerUser,
    loginUser,
    googleAuth,
    getCurrentUser,
    logoutUser,
    updateProfile,
    changePassword
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logoutUser);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;