import express from "express";
import {
    clerkWebhooks,
    payment,
    userCredits,
    verifyStripepay,
    stripeWebhook,
} from "../controllers/userController.js"; // Import controllers
import authUser from "../middleware/auth.js"; // Import authentication middleware

const userRouter = express.Router();

/**
 * Clerk Webhooks
 * Handles webhooks from Clerk for user-related events.
 */
userRouter.post("/webhooks", clerkWebhooks);

/**
 * Get User Credits
 * Protected route to retrieve the current user's credits.
 */
userRouter.get("/credits", authUser, userCredits);

/**
 * Stripe Payment Routes (Non-Webhook)
 * - /pay-stripe: Initiates a payment process (requires authentication).
 * - /verify-stripe: Verifies Stripe payment status.
 */
userRouter.post("/pay-stripe", authUser, payment);
userRouter.post("/verify-stripe", verifyStripepay);

/**
 * Stripe Webhook
 * Endpoint to handle Stripe webhook events.
 * Note: Signature verification is bypassed in this implementation.
 */
userRouter.post("/stripe-webhook", express.json(), stripeWebhook);

export default userRouter;
