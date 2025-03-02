import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import UserModel from "../models/userModel.js";

const removeBgImage = async (req, res) => {
  try {
    console.log("✅ [START] removeBgImage function called");
    
    const { clerkId } = req.body;
    console.log("📌 Clerk ID from request body:", clerkId);

    if (!clerkId) {
      console.log("❌ Error: Clerk ID is missing from request body.");
      return res.json({ success: false, message: "Clerk ID missing in request" });
    }

    const user = await UserModel.findOne({ clerkId });
    console.log("🔍 Searching for user in MongoDB...");

    if (!user) {
      console.log("❌ Error: User not found in MongoDB for Clerk ID:", clerkId);
      return res.json({ success: false, message: "User Not Found" });
    }

    console.log("✅ User found:", { id: user._id, email: user.email, creditBalance: user.creditBalance });

    if (user.creditBalance === 0) {
      console.log("❌ Error: User has no credits left.");
      return res.json({ success: false, message: "No Credit Balance", creditBalance: user.creditBalance });
    }

    if (!req.file) {
      console.log("❌ Error: No image file uploaded.");
      return res.json({ success: false, message: "No image uploaded" });
    }

    const imagePath = req.file.path;
    console.log("📁 Image Path:", imagePath);

    // Reading the image file
    const imageFile = fs.createReadStream(imagePath);
    console.log("📤 Preparing image for upload...");

    const formData = new FormData();
    formData.append("image_file", imageFile);

    console.log("🚀 Sending image to ClipDrop API...");
    const { data } = await axios.post(
      "https://clipdrop-api.co/remove-background/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    console.log("✅ Image processed successfully by ClipDrop API");

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

    console.log("💰 Deducting 1 credit from user account...");
    await UserModel.findByIdAndUpdate(user.id, { creditBalance: user.creditBalance - 1 });
    
    console.log("✅ Credit deducted. New balance:", user.creditBalance - 1);

    res.json({ success: true, resultImage, creditBalance: user.creditBalance - 1, message: "Background Removed" });
    console.log("🎉 [SUCCESS] Background removed and response sent.");

  } catch (error) {
    console.error("❌ [ERROR] removeBgImage failed:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export default removeBgImage;