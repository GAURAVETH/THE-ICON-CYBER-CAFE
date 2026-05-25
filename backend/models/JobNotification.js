import mongoose from "mongoose";

const jobNotificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Please provide a job title"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"]
        },
        description: {
            type: String,
            required: [true, "Please provide a job description"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters"]
        },
        requiredDocuments: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: ""
        },
        documents: [
            {
                filename: String,
                url: String,
                mimetype: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const JobNotification = mongoose.model("JobNotification", jobNotificationSchema);

export default JobNotification;
