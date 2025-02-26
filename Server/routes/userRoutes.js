import express from 'express';
import { clerkWebhooks } from '../controllers/userController.js'; // Added .js extension

const userRouter = express.Router();

userRouter.post('/webhooks', clerkWebhooks);

export default userRouter;
