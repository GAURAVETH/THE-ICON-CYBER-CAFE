import User from "../models/User.js";
import bcrypt from "bcryptjs";
import axios from "axios";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: "user"
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Error in registration"
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Check user exists and get password
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Your account has been deactivated"
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            }
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Error in login"
        });
    }
};

// @desc    Google OAuth Authentication
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "No token provided"
            });
        }

        // Fetch user details from Google
        const googleResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const { email, name, picture } = googleResponse.data;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Could not retrieve email from Google"
            });
        }

        // Check if user exists
        let user = await User.findOne({ email: email.toLowerCase() });

        // Create new user if doesn't exist
        if (!user) {
            user = await User.create({
                name: name || "Google User",
                email: email.toLowerCase(),
                avatar: picture,
                googleId: googleResponse.data.sub,
                // Generate random password for OAuth users
                password: Math.random().toString(36).slice(-16)
            });
        }

        const jwtToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Google authentication successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                },
                token: jwtToken
            }
        });
    } catch (error) {
        console.error("Google Auth Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to authenticate with Google"
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, email, avatar } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                phone,
                address,
                email,
                avatar
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select("+password");

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
