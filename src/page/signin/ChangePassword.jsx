import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../style/GradientBorder.css";
import {useChangePasswordMutation} from "../../service/memberService.js";

export const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [changePassword] = useChangePasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const response = await changePassword({ oldPassword, newPassword }).unwrap();
            setMessage(response.message);
            setError(null);
        } catch (err) {
            setError(err.data?.message || "Failed to change password.");
        }
    };

    return (
        <div className="gradient-border p-6 flex flex-col items-center h-full w-full relative box-border rounded-xl border-4 border-transparent z-[1]">
            {/* Outer Gradient Border */}
            <div className="h-full w-full relative p-1 rounded-lg shadow-md -m-[5px] bg-gradient-to-r from-red-500 to-orange-500 z-[-1]">
                {/* Inner Content Box */}
                <div className="bg-black flex flex-col rounded-lg shadow-md items-center p-6" style={{ borderRadius: "1em" }}>
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>

                    {/* Display Success or Error Message */}
                    {message && <p className="text-green-400">{message}</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* Form */}
                    <form className="w-full" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="text-orange-400 block mb-1">Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="bg-gray-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-orange-400 w-2/5"
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-orange-400 block mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-gray-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-orange-400 w-2/5"
                                placeholder="Enter new password"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-orange-400 block mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-gray-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-orange-400 w-2/5"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        {/* Save Button & Forgot Password Link */}
                        <div className="mb-4">
                            <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                                Save
                            </button>
                            <a href="/forgot-password" className="text-blue-400 hover:underline text-sm ml-2">
                                I forgot my password.
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
