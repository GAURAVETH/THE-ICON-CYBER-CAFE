import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Payment from "../models/Payment.js";
import Worker from "../models/Worker.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalWorkers = await User.countDocuments({ role: "worker" });
        const totalServices = await Service.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: "pending" });
        const totalRevenue = await Payment.aggregate([
            { $match: { status: { $in: ["captured", "completed"] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const recentBookings = await Booking.find()
            .populate("user", "name email")
            .populate("service", "title price")
            .sort({ createdAt: -1 })
            .limit(5);

        const bookingsByStatus = await Booking.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalWorkers,
                totalServices,
                totalBookings,
                pendingBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
                recentBookings,
                bookingsByStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select("-password")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, isActive, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                role,
                isActive,
                phone
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Don't allow deleting admin users
        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete admin users"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        // Delete associated bookings
        await Booking.deleteMany({ user: req.params.id });

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deactivated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const payments = await Payment.find(query)
            .populate("user", "name email")
            .populate("booking")
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: payments,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
export const getRevenueAnalytics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const monthlyRevenue = await Payment.aggregate([
            {
                $match: {
                    status: { $in: ["captured", "completed"] },
                    paymentDate: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" }
                    },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const paymentMethodDistribution = await Payment.aggregate([
            {
                $match: { status: { $in: ["captured", "completed"] } }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                monthlyRevenue,
                paymentMethodDistribution
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get booking analytics
// @route   GET /api/admin/analytics/bookings
// @access  Private/Admin
export const getBookingAnalytics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const bookingTrends = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const servicePerformance = await Booking.aggregate([
            {
                $group: {
                    _id: "$service",
                    totalBookings: { $sum: 1 },
                    revenue: { $sum: "$amount" },
                    avgRating: { $avg: "$rating.score" }
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "_id",
                    foreignField: "_id",
                    as: "serviceDetails"
                }
            },
            { $sort: { totalBookings: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                bookingTrends,
                servicePerformance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Assign worker to booking
// @route   PUT /api/admin/bookings/:id/assign-worker
// @access  Private/Admin
export const assignWorkerToBooking = async (req, res) => {
    try {
        const { workerId } = req.body;

        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: "Please provide worker ID"
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { worker: workerId, status: "confirmed" },
            { new: true }
        ).populate("worker", "name email phone");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Worker assigned successfully",
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
