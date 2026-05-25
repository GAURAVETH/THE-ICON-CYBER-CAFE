import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Please provide a blog title"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"]
        },
        description: {
            type: String,
            required: [true, "Please provide a blog description"],
            trim: true,
            minlength: [10, "Description must be at least 10 characters"]
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
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
