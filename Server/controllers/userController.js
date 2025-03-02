import Stripe from 'stripe';
import { Webhook } from 'svix';
import userModel from '../models/userModel.js';
import transactionModel from '../models/transactionModel.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhook = async (req, res) => {
    try {
        // Parse the event from the request body
        const event = req.body;

        console.log("📢 Stripe Webhook Triggered!");
        console.log("🔹 Event Type:", event.type);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const paymentId = session.payment_intent;
            const orderId = session.id;

            console.log("✅ Payment Successful!");
            console.log("💳 Payment ID:", paymentId);
            console.log("📦 Order ID:", orderId);

            // TODO: Update credits in the database here

            return res.status(200).json({ message: "Success", paymentId, orderId });
        }

        // Handle other event types if needed
        console.log(`⚠️ Unhandled Event Type: ${event.type}`);
        return res.status(400).json({ message: "Unhandled event type" });
    } catch (err) {
        console.error("❌ Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

// ✅ Clerk Webhooks Handling
const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        if (!req.headers["svix-id"] || !req.headers["svix-timestamp"] || !req.headers["svix-signature"]) {
            return res.status(400).json({ success: false, message: "Missing webhook headers" });
        }

        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;
        switch (type) {
            case "user.created":
                await userModel.create({
                    clerkId: data.id,
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                });
                break;

            case "user.updated":
                await userModel.findOneAndUpdate(
                    { clerkId: data.id },
                    {
                        email: data.email_addresses[0].email_address,
                        firstName: data.first_name,
                        lastName: data.last_name,
                        photo: data.image_url
                    }
                );
                break;

            case "user.deleted":
                await userModel.findOneAndDelete({ clerkId: data.id });
                break;

            default:
                console.log(`Unhandled webhook event: ${type}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// ✅ Fetch User Credits
const userCredits = async (req, res) => {
    try {
        const { clerkId } = req.body;
        const userData = await userModel.findOne({ clerkId });
        res.json({ success: true, credits: userData?.creditBalance || 0 });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Payment Integration (Using Stripe)
const payment = async (req, res) => {
    try {
        const { clerkId, planId } = req.body;
        const userData = await userModel.findOne({ clerkId });
        if (!userData || !planId) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        let credits, plan, amount;
        switch (planId) {
            case 'Basic':
                plan = "Basic";
                credits = 100;
                amount = 10;
                break;
            case 'Advanced':
                plan = "Advanced";
                credits = 500;
                amount = 50;
                break;
            case 'Business':
                plan = "Business";
                credits = 5000;
                amount = 250;
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid Plan" });
        }

        const date = Date.now();
        const newTransaction = await transactionModel.create({
            clerkId,
            plan,
            amount,
            credits,
            date,
            payment: false
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/buy?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            customer_email: userData.email,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: plan,
                            description: `${credits} Credits Package`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: { transactionId: newTransaction._id.toString() },
        });
        
        res.json({ success: true, id: session.id });
        
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
const verifyStripepay = async (req, res) => {
    try {
        const { stripepay_order_id } = req.body;
        
        // Fetch order details from Stripe
        const orderInfo = await stripe.orders.retrieve(stripepay_order_id);
        
        if (orderInfo.status === "paid") {
            // Fetch the transaction from database
            const transaction = await transactionModel.findById(orderInfo.receipt);

            if (transaction.payment) {
                return res.json({ success: false, message: 'Payment Failed' });
            }

            // Add credits to the user's account
            const userData = await userModel.findOne({ clerkId: transaction.clerkId });
            const creditBalance = userData.creditBalance + transaction.credits;
            await userModel.findByIdAndUpdate(userData._id, { creditBalance });

            // Mark transaction as paid
            await transactionModel.findByIdAndUpdate(transaction._id, { payment: true });

            return res.json({ success: true, message: "Credits Added" });
        }

        res.json({ success: false, message: "Payment not completed" });

    } catch (error) {
        console.error("❌ Error in verifyStripepay:", error.message);
        res.json({ success: false, message: error.message });
    }
};

export { clerkWebhooks, userCredits, payment, stripeWebhook,verifyStripepay };
