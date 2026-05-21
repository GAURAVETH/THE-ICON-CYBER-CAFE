import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        specializations: [
            {
                type: String,
                enum: [
                    "document_creation",
                    "typing",
                    "printing",
                    "scanning",
                    "website_development",
                    "form_filling",
                    "other"
                ]
            }
        ],

        services: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service"
            }
        ],

        bio: {
            type: String,
            maxlength: [500, "Bio cannot exceed 500 characters"]
        },

        experience: {
            type: Number,
            default: 0,
            min: 0
        },

        expertise: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        hourlyRate: {
            type: Number,
            default: 0,
            min: 0
        },

        certifications: [
            {
                name: String,
                issuer: String,
                issueDate: Date,
                expiryDate: Date,
                certificateUrl: String
            }
        ],

        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            totalReviews: {
                type: Number,
                default: 0
            }
        },

        availability: {
            isAvailable: {
                type: Boolean,
                default: true
            },
            workingHours: {
                start: String,
                end: String
            },
            offDays: [String]
        },

        completedBookings: {
            type: Number,
            default: 0
        },

        totalEarnings: {
            type: Number,
            default: 0
        },

        bankDetails: {
            accountHolder: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String
        },

        portfolio: [
            {
                title: String,
                description: String,
                imageUrl: String
            }
        ],

        isVerified: {
            type: Boolean,
            default: false
        },

        verificationDocuments: [
            {
                type: String,
                url: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const Worker = mongoose.model("Worker", workerSchema);

export default Worker;
