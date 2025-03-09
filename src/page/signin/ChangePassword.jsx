import React from "react";
import { Link } from "react-router-dom"; // For navigation

const ChangePassword = () => {
    return (
        <div
            className="p-6 flex flex-col items-center h-full w-full relative box-border rounded-xl border-4 border-transparent z-[1]">

            {/* Outer Gradient Border */}
            <div
                className="h-full w-full relative p-1 rounded-lg shadow-md -m-[5px] bg-gradient-to-r from-red-500 to-orange-500 z-[-1]">

                {/* Inner Content Box */}
                <div
                    className="bg-black flex flex-col rounded-lg shadow-md items-center p-6"
                    style={{borderRadius: "1em"}}
                >
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>

                    {/* Form */}
                    <form className="w-full">
                        <div className="mb-4">
                            <label className="text-orange-400 block mb-1">Old Password</label>
                            <input
                                type="password"
                                className="bg-gray-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-orange-400 w-2/5"
                                placeholder="Enter old password"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-orange-400 block mb-1">New Password</label>
                            <input
                                type="password"
                                className="bg-gray-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-orange-400 w-2/5"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-orange-400 block mb-1">Confirm Password</label>
                            <input
                                type="password"
                                className="bg-gray-800 text-white p-2 rounded-lg focus:ring-2 focus:ring-orange-400 w-2/5"
                                placeholder="Confirm new password"
                            />
                        </div>
                        {/* Forgot Password Link */}
                        <div className="mb-4">
                            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                                Save
                            </button>
                            <Link
                                to="/forgot-password"
                                className="text-blue-400 hover:underline text-sm ml-2"
                            >
                                I forgot my password.
                            </Link>
                            {/* Save Button */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
