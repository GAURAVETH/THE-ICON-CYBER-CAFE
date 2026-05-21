import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "iconCyberCafe",
                resource_type: "auto",
            },
            (error, result) => {

                if (error) {
                    console.log("CLOUDINARY ERROR:", error);
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(stream);
    });
};

export const uploadFile = async (req, res) => {

    try {

        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded",
            });
        }

        const uploadedFiles = [];

        for (const file of req.files) {

            console.log("Uploading:", file.originalname);

            const result = await streamUpload(file.buffer);

            uploadedFiles.push({
                filename: file.originalname,
                url: result.secure_url,
                public_id: result.public_id,
                mimetype: file.mimetype,
            });
        }

        return res.status(200).json({
            success: true,
            files: uploadedFiles,
        });

    } catch (error) {

        console.log("UPLOAD FAILED:");
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};