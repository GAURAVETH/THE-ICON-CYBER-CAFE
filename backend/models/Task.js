import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking"
        },

        title: {
            type: String,
            required: [true, "Please provide a task title"],
            trim: true
        },

        description: String,

        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "on-hold"],
            default: "pending"
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },

        dueDate: Date,

        completedAt: Date,

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        attachments: [
            {
                filename: String,
                url: String,
                uploadedAt: Date
            }
        ],

        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                text: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;