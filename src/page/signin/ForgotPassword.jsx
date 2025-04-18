import React, { useState } from "react";
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
        <div className="relative min-h-screen bg-black">
            <div className="absolute inset-0 w-full h-screen bg-cover bg-center opacity-50"
                 style={{backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/pexels-bess-hamiti-83687-36487.jpg?alt=media&token=f1fb933e-2fe4-4f6f-a604-7eb7e47314fd)`}}>
            </div>
            {/* Logo */}
            <div className="absolute top-5 left-5 flex items-end">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                    alt="GoBeyond Logo"
                    className="h-10 rounded-full"
                />
                <div className="flex mt-2">
                    <div className="text-4xl font-bold text-white">Go</div>
                    <div className="text-4xl font-bold text-yellow-400">Beyond</div>
                </div>
            </div>
            <div className="w-full h-screen flex items-center justify-center relative">
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
        </div>
    );
}

export default ForgotPassword;
