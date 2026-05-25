import JobNotification from "../models/JobNotification.js";

export const getAllJobNotifications = async (req, res) => {
    try {
        const notifications = await JobNotification.find({ isActive: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createJobNotification = async (req, res) => {
    try {
        const { title, description, requiredDocuments, image, documents } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Please provide title and description"
            });
        }

        const job = await JobNotification.create({
            title: title.trim(),
            description: description.trim(),
            requiredDocuments: requiredDocuments || "",
            image: image || "",
            documents: Array.isArray(documents) ? documents : []
        });

        res.status(201).json({
            success: true,
            message: "Job notification created successfully",
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateJobNotification = async (req, res) => {
    try {
        const job = await JobNotification.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job notification not found"
            });
        }

        const { title, description, requiredDocuments, image, isActive, documents } = req.body;
        const updates = {};

        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (requiredDocuments !== undefined) updates.requiredDocuments = requiredDocuments;
        if (image !== undefined) updates.image = image;
        if (isActive !== undefined) updates.isActive = isActive;
        if (documents !== undefined) updates.documents = Array.isArray(documents) ? documents : [];

        const updatedJob = await JobNotification.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Job notification updated successfully",
            data: updatedJob
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteJobNotification = async (req, res) => {
    try {
        const job = await JobNotification.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job notification not found"
            });
        }

        await JobNotification.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Job notification deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
