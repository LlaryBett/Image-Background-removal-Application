import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_URI; // Ensure env variable is named correctly
        if (!dbURI) {
            throw new Error("❌ MongoDB URL is missing in .env file");
        }

        await mongoose.connect(dbURI); // No need for deprecated options
        
        console.log("✅ Database Connected");

    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
