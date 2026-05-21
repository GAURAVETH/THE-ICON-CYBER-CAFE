import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import axios from "axios";

// @desc    Create payment order (Razorpay)
// @route   POST /api/payments/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
    try {
        const { bookingId, emiMonths } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Calculate amount
        let amount = booking.amount;
        if (emiMonths) {
            amount = (booking.amount / emiMonths) * 100; // First installment
        }

        // Create Razorpay order
        const razorpayResponse = await axios.post(
            "https://api.razorpay.com/v1/orders",
            {
                amount: Math.round(amount * 100), // Amount in paise
                currency: "INR",
                receipt: bookingId.toString(),
                payment_capture: 1
            },
            {
                auth: {
                    username: process.env.RAZORPAY_KEY_ID,
                    password: process.env.RAZORPAY_KEY_SECRET
                }
            }
        );

        res.status(200).json({
            success: true,
            data: {
                orderId: razorpayResponse.data.id,
                amount: razorpayResponse.data.amount,
                currency: razorpayResponse.data.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error("Razorpay Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create payment order"
        });
    }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { bookingId, orderId, paymentId, signature, paymentMethod, emiMonths } = req.body;

        // Verify Razorpay signature
        const crypto = await import("crypto");
        const expectedSignature = crypto
            .default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Create payment record
        const payment = await Payment.create({
            user: req.user.id,
            booking: bookingId,
            amount: booking.amount,
            paymentMethod,
            paymentGateway: "razorpay",
            transactionId: paymentId,
            orderId,
            status: "captured",
            emiDetails: {
                enabled: emiMonths ? true : false,
                months: emiMonths || null,
                monthlyAmount: emiMonths ? booking.amount / emiMonths : null
            }
        });

        // Update booking payment status
        booking.paymentStatus = "completed";
        booking.paymentId = paymentId;
        booking.paymentMethod = paymentMethod;
        if (emiMonths) {
            booking.emiDetails.enabled = true;
            booking.emiDetails.months = emiMonths;
            booking.emiDetails.monthlyAmount = booking.amount / emiMonths;
        }
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: payment
        });
    } catch (error) {
        console.error("Payment Verification Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Payment verification failed"
        });
    }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        let query = { user: req.user.id };

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const payments = await Payment.find(query)
            .populate("booking")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

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

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate("booking");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        // Check permission
        if (payment.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
export const processRefund = async (req, res) => {
    try {
        const { reason } = req.body;

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        if (payment.status !== "captured") {
            return res.status(400).json({
                success: false,
                message: "Only captured payments can be refunded"
            });
        }

        // Process refund with Razorpay
        const refundResponse = await axios.post(
            `https://api.razorpay.com/v1/payments/${payment.transactionId}/refund`,
            {
                amount: Math.round(payment.amount * 100),
                notes: {
                    reason
                }
            },
            {
                auth: {
                    username: process.env.RAZORPAY_KEY_ID,
                    password: process.env.RAZORPAY_KEY_SECRET
                }
            }
        );

        payment.status = "refunded";
        payment.refund = {
            amount: payment.amount,
            status: "processed",
            reason,
            processedAt: new Date()
        };
        await payment.save();

        // Update booking
        const booking = await Booking.findById(payment.booking);
        booking.paymentStatus = "refunded";
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Refund processed successfully",
            data: payment
        });
    } catch (error) {
        console.error("Refund Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to process refund"
        });
    }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats/dashboard
// @access  Private
export const getPaymentStats = async (req, res) => {
    try {
        const totalAmount = await Payment.aggregate([
            {
                $match: {
                    user: req.user._id,
                    status: "captured"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const totalPayments = await Payment.countDocuments({
            user: req.user.id,
            status: "captured"
        });

        const failedPayments = await Payment.countDocuments({
            user: req.user.id,
            status: "failed"
        });

        res.status(200).json({
            success: true,
            data: {
                totalAmount: totalAmount[0]?.total || 0,
                totalPayments,
                failedPayments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
