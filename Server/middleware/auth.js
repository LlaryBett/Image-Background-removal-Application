import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
    try {
      console.log("Received Headers:", req.headers); // Debugging step
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No valid Authorization header received.");
        return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
      }
  
      const token = authHeader.split(" ")[1];
      console.log("Extracted Token:", token);
  
      const token_decode = jwt.decode(token);
      if (!token_decode || !token_decode.sub) {
        console.log("Invalid token. 'sub' field missing.");
        return res.status(401).json({ success: false, message: "Invalid token. Login Again." });
      }
  
      req.body.clerkId = token_decode.sub;
      console.log("Clerk ID Set in Request Body:", req.body.clerkId);
  
      next();
    } catch (error) {
      console.log("Auth Error:", error.message);
      res.status(500).json({ success: false, message: "Authentication Failed" });
    }
  };
  
export default authUser;
