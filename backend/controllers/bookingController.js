import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        const { serviceId, bookingDate, description, useEMI, emiMonths, quantity = 1, travelDetails, formName, personalDetails, documents } = req.body;

        // Validation
        if (!serviceId || !bookingDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide service and booking date"
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        if (!service.isActive) {
            return res.status(400).json({
                success: false,
                message: "This service is currently unavailable"
            });
        }

        // Check availability
        if (service.currentBookings >= service.maxBookings) {
            return res.status(400).json({
                success: false,
                message: "Service is fully booked"
            });
        }

        const unitPrice = service.formFields?.isPerItemPricing
            ? (service.formFields.itemPrice || service.price)
            : service.price;

        const amount = unitPrice * quantity;

        const booking = await Booking.create({
            user: req.user.id,
            service: serviceId,
            bookingDate: new Date(bookingDate),
            amount,
            quantity,
            travelDetails,
            formName,
            personalDetails,
            documents,
            description,
            emiDetails: {
                enabled: useEMI || false,
                months: emiMonths || null
            }
        });

        // Increment service booking count
        service.currentBookings += 1;
        await service.save();

        // Add to user's booking history
        await User.findByIdAndUpdate(req.user.id, {
            $push: { bookingHistory: booking._id },
            $inc: { totalBookings: 1 }
        });

        const populatedBooking = await booking.populate("service");

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: populatedBooking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all bookings (with user/admin filtering)
// @route   GET /api/bookings
// @access  Private
export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, sortBy = "createdAt" } = req.query;

        let query = {};

        // If user is not admin, show only their bookings
        if (req.user.role !== "admin") {
            query.user = req.user.id;
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const bookings = await Booking.find(query)
            .populate("user", "name email phone")
            .populate("service", "title price category")
            .populate("worker", "name email phone")
            .sort({ [sortBy]: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            data: bookings,
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("user")
            .populate("service")
            .populate("worker");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if user has permission to view
        if (req.user.role !== "admin" && booking.user._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this booking"
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Please provide status"
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate("service");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // If booking is completed, update service booking count
        if (status === "completed") {
            booking.completionDate = new Date();
            await booking.save();

            const service = await Service.findById(booking.service._id);
            if (service && service.currentBookings > 0) {
                service.currentBookings -= 1;
                await service.save();
            }
        }

        res.status(200).json({
            success: true,
            message: "Booking status updated",
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add rating to booking
// @route   PUT /api/bookings/:id/rate
// @access  Private
export const rateBooking = async (req, res) => {
    try {
        const { score, comment } = req.body;

        if (!score || score < 0 || score > 5) {
            return res.status(400).json({
                success: false,
                message: "Please provide a rating between 0 and 5"
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if user has permission
        if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        booking.rating = {
            score,
            comment
        };

        await booking.save();

        // Update service rating
        const bookings = await Booking.find({ service: booking.service, "rating.score": { $exists: true } });
        const avgRating = bookings.reduce((acc, b) => acc + b.rating.score, 0) / bookings.length;

        await Service.findByIdAndUpdate(
            booking.service,
            { ratings: avgRating, reviewCount: bookings.length }
        );

        res.status(200).json({
            success: true,
            message: "Rating added successfully",
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if user has permission
        if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        booking.status = "cancelled";
        await booking.save();

        // Update service availability
        const service = await Service.findById(booking.service);
        if (service && service.currentBookings > 0) {
            service.currentBookings -= 1;
            await service.save();
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats/dashboard
// @access  Private
export const getBookingStats = async (req, res) => {
    try {
        const query = req.user.role === "admin" ? {} : { user: req.user.id };

        const totalBookings = await Booking.countDocuments(query);
        const pendingBookings = await Booking.countDocuments({ ...query, status: "pending" });
        const completedBookings = await Booking.countDocuments({ ...query, status: "completed" });
        const totalRevenue = await Booking.aggregate([
            { $match: { ...query, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                pendingBookings,
                completedBookings,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
