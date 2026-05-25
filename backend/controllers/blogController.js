import Blog from "../models/Blog.js";

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title, description, image, documents } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Please provide title and description"
            });
        }

        const blog = await Blog.create({
            title: title.trim(),
            description: description.trim(),
            image: image || "",
            documents: Array.isArray(documents) ? documents : []
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const { title, description, image, isPublished, documents } = req.body;
        const updates = {};

        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (image !== undefined) updates.image = image;
        if (isPublished !== undefined) updates.isPublished = isPublished;
        if (documents !== undefined) updates.documents = Array.isArray(documents) ? documents : [];

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
