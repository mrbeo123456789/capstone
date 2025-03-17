import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import {useVerifyAccountMutation} from "../../service/authService.js";

const EnterOTP = () => {
    const location = useLocation();
    const email = location.state?.email || ""; // Retrieve email from navigation state
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();
    const [verifyAccount, { isLoading }] = useVerifyAccountMutation();

    const handleVerifyOTP = async () => {
        if (!email || !otp) {
            toast.error("Email or OTP is missing!");
            return;
        }

        try {
            const response = await verifyAccount({ email, otp });
            toast.success(response.message);
            navigate("/reset-password", { state: { email } }); // Navigate with email
        } catch (error) {
            toast.error(error.data || "Invalid OTP or OTP expired!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-red-700 to-orange-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <FaLock className="text-4xl mb-4" />
                <h2 className="text-lg font-bold mb-4">Enter OTP</h2>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    className="p-2 mb-4 w-full bg-black border border-red-500 rounded-lg text-white"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
                <button
                    onClick={handleVerifyOTP}
                    className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Verifying..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default EnterOTP;
