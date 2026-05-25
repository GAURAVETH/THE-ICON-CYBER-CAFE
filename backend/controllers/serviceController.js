import Service from "../models/Service.js";

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10, isFeatured, sort } = req.query;

        let query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (isFeatured !== undefined) {
            query.isFeatured = isFeatured === "true";
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        let sortQuery = { createdAt: -1 };
        if (sort === "-currentBookings") {
            sortQuery = { currentBookings: -1, createdAt: -1 };
        } else if (sort) {
            sortQuery = sort;
        }

        const services = await Service.find(query)
            .sort(sortQuery)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Service.countDocuments(query);

        res.status(200).json({
            success: true,
            data: services,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create service (Admin only)
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res) => {
    try {
        const {
            title,
            description,
            requiredDocuments,
            price,
            category,
            duration,
            maxBookings,
            emiOptions,
            image,
            formFields,
            availability = true,
            isFeatured = false,
            documents
        } = req.body;

        const numericPrice = Number(price);

        if (!title || !description || price === undefined || price === "" || Number.isNaN(numericPrice) || !category) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        let parsedDuration = duration;
        if (typeof duration === "string") {
            try {
                parsedDuration = JSON.parse(duration);
            } catch {
                parsedDuration = { value: 1, unit: "hours" };
            }
        }

        let parsedFormFields = formFields;
        if (typeof formFields === "string") {
            try {
                parsedFormFields = JSON.parse(formFields);
            } catch {
                parsedFormFields = {};
            }
        }

        const service = await Service.create({
            title: title.trim(),
            description: description.trim(),
            requiredDocuments: requiredDocuments || "",
            price: numericPrice,
            category,
            duration: parsedDuration,
            formFields: parsedFormFields,
            maxBookings: maxBookings || 10,
            emiOptions,
            availability,
            isFeatured,
            image: image || null,
            documents: Array.isArray(documents) ? documents : []
        });

        res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update service (Admin only)
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        const {
            title,
            description,
            requiredDocuments,
            price,
            category,
            duration,
            maxBookings,
            emiOptions,
            isActive,
            availability,
            image,
            isFeatured,
            documents,
            formFields
        } = req.body;

        const updates = {};

        if (title !== undefined) updates.title = title.trim();
        if (description !== undefined) updates.description = description.trim();
        if (requiredDocuments !== undefined) updates.requiredDocuments = requiredDocuments;
        if (price !== undefined) {
            const numericPrice = Number(price);

            if (Number.isNaN(numericPrice)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid price"
                });
            }

            updates.price = numericPrice;
        }
        if (category !== undefined) updates.category = category;
        if (duration !== undefined) updates.duration = duration;
        if (maxBookings !== undefined) updates.maxBookings = maxBookings;
        if (emiOptions !== undefined) updates.emiOptions = emiOptions;
        if (isActive !== undefined) updates.isActive = isActive;
        if (availability !== undefined) updates.availability = availability;
        if (image !== undefined) updates.image = image;
        if (isFeatured !== undefined) updates.isFeatured = isFeatured;
        if (documents !== undefined) updates.documents = Array.isArray(documents) ? documents : [];
        if (formFields !== undefined) updates.formFields = formFields;

        service = await Service.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete service (Admin only)
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        await Service.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get service statistics (Admin only)
// @route   GET /api/services/stats
// @access  Private/Admin
export const getServiceStats = async (req, res) => {
    try {
        const totalServices = await Service.countDocuments();
        const activeServices = await Service.countDocuments({ isActive: true });
        const avgPrice = await Service.aggregate([
            { $group: { _id: null, avg: { $avg: "$price" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalServices,
                activeServices,
                averagePrice: avgPrice[0]?.avg || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
