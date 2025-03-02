import "dotenv/config"; // Load environment variables
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js"; // MongoDB connection
import userRouter from "./routes/userRoutes.js"; // User-related routes
import imageRouter from "./routes/imageRoutes.js"; // Image-related routes

const PORT = process.env.PORT || 4000; // Default port
const app = express();

(async () => {
    try {
        // ✅ Connect to MongoDB
        console.log("⏳ Connecting to MongoDB...");
        await connectDB();
        console.log("✅ MongoDB Connected!");

        // ✅ Middleware
        app.use(cors()); // Enable Cross-Origin Resource Sharing
        app.use(express.json()); // Parse JSON request bodies

        // ✅ API Routes
        app.get("/", (req, res) => res.send("API Working")); // Health check route
        app.use("/api/user", userRouter); // User-related routes
        app.use("/api/image", imageRouter); // Image-related routes

        // ✅ Start the Server
        app.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        );
    } catch (err) {
        console.error("❌ Error starting server:", err.message);
        process.exit(1); // Exit the process on failure
    }
})();
