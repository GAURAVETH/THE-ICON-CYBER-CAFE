import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Please provide a service title"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [100, "Title cannot be more than 100 characters"]
        },

        description: {
            type: String,
            required: [true, "Please provide a description"],
            minlength: [10, "Description must be at least 10 characters"]
        },

        price: {
            type: Number,
            required: [true, "Please provide a price"],
            min: [0, "Price cannot be negative"]
        },

        duration: {
            value: {
                type: Number,
                default: 1
            },
            unit: {
                type: String,
                enum: ["hours", "days"],
                default: "hours"
            }
        },

        image: {
            type: String,
            default: null
        },

        category: {
            type: String,
            enum: [
                "document",
                "typing",
                "printing",
                "scanning",
                "website",
                "forms",
                "other"
            ],
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        availability: {
            type: Boolean,
            default: true
        },

        maxBookings: {
            type: Number,
            default: 10
        },

        currentBookings: {
            type: Number,
            default: 0
        },

        formFields: {
            requiresDocuments: { type: Boolean, default: false },
            requiresTravelDetails: { type: Boolean, default: false },
            requiresFormName: { type: Boolean, default: false },
            isPerItemPricing: { type: Boolean, default: false },
            itemPrice: { type: Number, default: 0 },
            requiresPersonalDetails: { type: Boolean, default: true },
            documentTypes: [{ type: String }], 
            requiresPickupTime: { type: Boolean, default: false }
        },

        emiOptions: {
            available: {
                type: Boolean,
                default: false
            },
            months: {
                type: [Number],
                default: [3, 6, 12]
            }
        },

        ratings: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        reviewCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;