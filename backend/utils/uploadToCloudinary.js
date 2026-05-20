import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (Buffer,folder = "general") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (result) {resolve(result);
                } else {reject(error);
                }
            }
        );
        streamifier.createReadStream(Buffer).pipe(stream);
    });
};
             