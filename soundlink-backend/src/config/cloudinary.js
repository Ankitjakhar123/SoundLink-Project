import cloudinary from 'cloudinary';

const connectCloudinary = () => {
    try {
        // Check if all required environment variables are present
        if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
            console.warn("Missing Cloudinary configuration variables. File uploads may not work correctly.");
            // Log which specific variables are missing
            if (!process.env.CLOUDINARY_NAME) console.warn("CLOUDINARY_NAME is missing");
            if (!process.env.CLOUDINARY_API_KEY) console.warn("CLOUDINARY_API_KEY is missing");
            if (!process.env.CLOUDINARY_SECRET_KEY) console.warn("CLOUDINARY_SECRET_KEY is missing");
            return;
        }

        // Configure cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
        });

        console.log("Cloudinary configuration successful");
    } catch (error) {
        console.error("Cloudinary configuration error:", error);
    }
};

export default connectCloudinary;
