import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadRoot = path.resolve(__dirname, "..", "uploads");

const sanitizeFileName = (filename) => {
    const parsedName = path.parse(filename || "upload");
    const safeBase = parsedName.name
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80) || "upload";
    const safeExt = parsedName.ext.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 12);

    return `${safeBase}${safeExt}`;
};

export const toFileArray = (files) => {
    if (!files) return [];
    return Array.isArray(files) ? files : [files];
};

export const saveUploadedFile = async (file, folder) => {
    const targetFolder = path.join(uploadRoot, folder);
    await mkdir(targetFolder, { recursive: true });

    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniquePrefix}-${sanitizeFileName(file.name)}`;
    const destination = path.join(targetFolder, filename);

    await file.mv(destination);

    return {
        filename: file.name,
        storedFilename: filename,
        url: `/api/uploads/${folder}/${filename}`,
        mimetype: file.mimetype,
        size: file.size
    };
};
