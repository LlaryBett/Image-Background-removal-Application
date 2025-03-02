import { createContext, useState } from "react";
import PropTypes from "prop-types";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import axios from 'axios';
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom";
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const [credit, setCredit] = useState(false);
    const [image, setImage] = useState(false)
    const [resultImage, setResultImage] = useState(false)


    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate()
    const { getToken } = useAuth();
    const { isSignedIn } = useUser()
    const { openSignIn } = useClerk()

    const loadCreditsData = async () => {
        try {
            const token = await getToken(); 
            console.log("Token retrieved:", token); // Debugging purpose
    
            const { data } = await axios.get(`${backendUrl}/api/user/credits`, { 
                headers: { 
                    Authorization: `Bearer ${token}` // Corrected token format
                } 
            });
    
            if (data.success) {
                setCredit(data.credits);
                console.log("Credits:", data.credits);
            }
        } catch (error) {
            console.error("Error loading credits data:", error.response?.data || error.message);
        }
    };
    
    const removeBg = async (image) => {
        try {
            if (!isSignedIn) {
                return openSignIn();
            }
    
            setImage(image);
            setResultImage(false);
    
            const token = await getToken();
            if (!token) {
                toast.error("Authentication failed. Please log in again.");
                return;
            }
    
            const tokenData = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
            const clerkId = tokenData.sub; // Extract Clerk ID
    
            console.log("📤 Sending Clerk ID:", clerkId); // Debugging
    
            const formData = new FormData();
            formData.append("image", image);
            formData.append("clerkId", clerkId);
    
            const response = await axios.post(`${backendUrl}/api/image/remove-bg`, formData, { 
                headers: { 
                    Authorization: `Bearer ${token}`,  // ✅ Corrected Authorization header
                    "Content-Type": "multipart/form-data"
                } 
            });
    
            console.log("✅ Backend Response:", response.data);
    
            if (!response.data.success && response.data.message === "No Credit Balance") {
                toast.error("You have no credit balance left. Please buy more credits.");
                setTimeout(() => navigate('/buy'), 2000);
                return;
            }
    
            if (response.data.success && response.data.resultImage) {
                console.log("🖼️ Setting resultImage in state:", response.data.resultImage);
                setResultImage(response.data.resultImage);
                navigate('/result'); 
    
                loadCreditsData(); // ✅ Fetch updated credits after API call
            } else {
                console.warn("⚠️ No result image received from API!");
                toast.error("Failed to process the image. Please try again.");
            }
    
        } catch (error) {
            console.error("❌ Error in removeBg:", error);
            toast.error(error.response?.data?.message || "An error occurred. Please try again.");
        }
    };
    
    
    const value = {
        credit,
        setCredit,
        backendUrl,
        image, setImage,
        loadCreditsData,
        resultImage,setResultImage,
        removeBg // Include the function so other components can use it
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Define PropTypes for validation
AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AppContextProvider;
