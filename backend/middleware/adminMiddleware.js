import User from "../models/User.js";

// Middleware to check if user is admin
const adminCheck = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized - please login"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied - Admin only"
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default adminCheck;
