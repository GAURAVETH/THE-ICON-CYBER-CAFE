import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },

        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        status: {
            type: String,
            enum: ["awaiting-payment", "pending", "confirmed", "in-progress", "completed", "cancelled"],
            default: "pending"
        },

        bookingDate: {
            type: Date,
            required: true
        },

        completionDate: Date,

        amount: {
            type: Number,
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending"
        },

        paymentMethod: {
            type: String,
            enum: ["credit_card", "debit_card", "upi", "net_banking", "wallet"],
            default: "wallet"
        },

        paymentId: String,

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
            }
        },

        description: String,

        notes: String,

        rating: {
            score: {
                type: Number,
                min: 0,
                max: 5
            },
            comment: String
        },

        documents: [
            {
                filename: String,
                url: String,
                documentType: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        quantity: {
            type: Number,
            default: 1
        },

        travelDetails: {
            from: String,
            to: String
        },

        formName: String,

        personalDetails: {
            name: String,
            phone: String,
            email: String
        },
        pickupTime: String
    },
    {
        timestamps: true
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;