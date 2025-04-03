import { useState } from "react";
import { Link } from "react-router-dom";
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
        <div className="flex">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-orange-100">
                    <h2 className="text-3xl font-bold text-orange-700 mb-6 text-center">Change Password</h2>

                    {/* Display Success or Error Message */}
                    {message && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-orange-600 mb-2">Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-orange-600 mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Enter new password"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-orange-600 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition duration-300"
                            >
                                Save Changes
                            </button>
                            <Link
                                to="/forgot-password"
                                className="text-orange-600 hover:underline text-sm"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;