import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },

        amount: {
            type: Number,
            required: [true, "Please provide payment amount"],
            min: [0, "Amount cannot be negative"]
        },

        paymentMethod: {
            type: String,
            enum: ["credit_card", "debit_card", "upi", "net_banking", "wallet"],
            required: true
        },

        paymentGateway: {
            type: String,
            enum: ["razorpay", "stripe"],
            required: true
        },

        transactionId: {
            type: String,
            required: true,
            unique: true
        },

        orderId: String,

        status: {
            type: String,
            enum: ["pending", "initiated", "captured", "failed", "refunded"],
            default: "pending"
        },

        paymentDate: {
            type: Date,
            default: Date.now
        },

        emiDetails: {
            enabled: {
                type: Boolean,
                default: false
            },
            months: Number,
            monthlyAmount: Number,
            paidMonths: {
                type: Number,
                default: 0
            },
            nextDueDate: Date
        },

        refund: {
            amount: Number,
            status: String,
            reason: String,
            processedAt: Date
        },

        receiptUrl: String,

        notes: String
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
