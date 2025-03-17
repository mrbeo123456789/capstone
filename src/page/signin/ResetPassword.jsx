import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {useResetPasswordMutation} from "../../service/authService.js";

const ResetPassword = () => {
    const location = useLocation();
    const email = location.state?.email || ""; // Retrieve email from previous step
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            toast.error("Please enter your new password!");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (!email) {
            toast.error("Email is missing, please restart the reset process!");
            return;
        }

        try {
            const response = await resetPassword({ email, newPassword: password }).unwrap();
            toast.success(response.message);
            navigate("/login"); // Redirect to login after success
        } catch (error) {
            toast.error(error.data || "Failed to reset password!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-red-700 to-orange-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                <input
                    type="password"
                    placeholder="New password"
                    className="p-2 mt-4 w-full border border-red-500 rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    className="p-2 mt-2 w-full border border-red-500 rounded-lg"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                    onClick={handleResetPassword}
                    className="bg-red-600 px-4 py-2 mt-4 rounded w-full text-white hover:bg-red-700"
                    disabled={isLoading}
                >
                    {isLoading ? "Resetting..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default ResetPassword;
