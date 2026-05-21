import Task from "../models/Task.js";
import Booking from "../models/Booking.js";

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
    try {
        const { title, description, bookingId, priority, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Please provide task title"
            });
        }

        const task = await Task.create({
            user: req.user.id,
            title,
            description,
            booking: bookingId || null,
            priority: priority || "medium",
            dueDate: dueDate || null
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getAllTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, priority } = req.query;

        let query = { user: req.user.id };

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        const skip = (page - 1) * limit;

        const tasks = await Task.find(query)
            .populate("user", "name email")
            .populate("booking")
            .populate("assignedTo", "name email")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tasks,
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

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("user")
            .populate("booking")
            .populate("assignedTo");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check if user has permission
        if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check permission
        if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        const { title, description, status, priority, dueDate, assignedTo } = req.body;

        task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                status,
                priority,
                dueDate,
                assignedTo
            },
            { new: true, runValidators: true }
        ).populate("assignedTo", "name email");

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Check permission
        if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Please provide status"
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        task.status = status;

        if (status === "completed") {
            task.completedAt = new Date();
        }

        await task.save();

        res.status(200).json({
            success: true,
            message: "Task status updated",
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addTaskComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Please provide comment text"
            });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        user: req.user.id,
                        text
                    }
                }
            },
            { new: true }
        ).populate("comments.user", "name email");

        res.status(200).json({
            success: true,
            message: "Comment added successfully",
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments({ user: req.user.id });
        const completedTasks = await Task.countDocuments({
            user: req.user.id,
            status: "completed"
        });
        const pendingTasks = await Task.countDocuments({
            user: req.user.id,
            status: "pending"
        });

        res.status(200).json({
            success: true,
            data: {
                totalTasks,
                completedTasks,
                pendingTasks,
                completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
