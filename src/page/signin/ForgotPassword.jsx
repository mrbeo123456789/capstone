import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {useForgotPasswordMutation} from "../../service/authService.js";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        try {
            console.log("Forgot Password Response:", email);
            const response = await forgotPassword(email);
            console.log("DDDDDDDDDDDDDDDDDDDDDDDDDD", email);

            toast.success(response.message);
            navigate("/enter-otp", { state: { email } }); // Navigate to the OTP page
        } catch (error) {
            toast.error(error.data?.message || "Something went wrong.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-red-700 to-orange-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center text-red-600">Forgot Password?</h2>
                <p className="text-gray-600 text-sm text-center mb-4">Enter your email to receive an OTP.</p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Get New Password"}
                    </button>
                </form>
                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-red-500 hover:underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
