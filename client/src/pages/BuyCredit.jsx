import React, { useContext } from "react";
import { assets, plans } from "../assets/assets";
import { loadStripe } from "@stripe/stripe-js";
import { AppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Load Stripe (Replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BuyCredit = () => {
  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();
  const navigate = useNavigate(); // ✅ Fix for navigation

  const handlePurchase = async (plan) => {
    try {
      const stripe = await stripePromise;
      const token = await getToken();
      console.log("Retrieved Token:", token); // Debugging

      if (!token) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }

      // Send request to backend to create Stripe Checkout session
      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-stripe`,
        { planId: plan.id }, // ✅ Send plan ID in request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Corrected token usage
            "Content-Type": "application/json",
          },
        }
      );

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId: data.id });

      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] text-center pt-14 mb-10">
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent mb-6 sm:mb-10">
        Choose the plan that's right for you
      </h1>
      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            className="bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-700 hover:scale-105 transition-all duration-700"
            key={index}
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className="mt-3 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price}</span>/{item.credits} credits
            </p>
            <button
              onClick={() => handlePurchase(item)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredit;
