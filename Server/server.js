import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';

// App Config
const PORT = process.env.PORT || 4000; // ✅ Correctly accessing PORT
const app = express();
await connectDB()

// Initialize Middlewares
app.use(express.json());
app.use(cors());

// API routes 
app.get('/', (req, res) => res.send("API Working"));

// Start the Server
app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
