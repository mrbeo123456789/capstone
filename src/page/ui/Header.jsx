import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export const Header = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("jwt_token"); // Clear JWT Token
        navigate("/login"); // Redirect to Login Page
    };

    const menuItems = [
        { href: "/aboutus", title: "About", text: "About" },
        { href: "/guide", title: "Guide", text: "Guide" },
        { href: "/challenges", title: "Challenges", text: "Challenges" },
        { href: "/ranking", title: "Leaderboard", text: "Leaderboard" },
        { href: "/news", title: "News", text: "News" },
    ];

    return (
        <div className="relative">
            {/* Header */}
            <header className="bg-[#f78730] shadow-md py-4 w-full z-50 relative">
                <div className="flex justify-between items-center px-4">
                    <div className="flex items-center space-x-4">
                        {/* Sidebar Toggle Button */}
                        <button
                            className="flex flex-col space-y-1"
                            onClick={toggleSidebar}
                        >
                            <span className="block w-6 h-1 bg-orange-400"></span>
                            <span className="block w-6 h-1 bg-orange-400"></span>
                            <span className="block w-6 h-1 bg-orange-400"></span>
                        </button>
                        {/* Logo */}
                        <h2 className="text-xl font-bold flex items-center space-x-2">
                            <a href="/" className="flex items-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                                    alt="GoBeyond"
                                    className="h-10 rounded-full"
                                />
                                <span className="ml-2 font-bold text-lg">GoBeyond</span>
                            </a>
                        </h2>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex space-x-6">
                        <ul className="flex space-x-4">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        title={item.title}
                                        className="hover:text-red-500 transition font-medium"
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <button className="btn btn-primary dropdown-toggle">
                                <img
                                    title="Vietnamese"
                                    src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
                                    alt="Vietnamese"
                                    className="h-6 w-8 rounded"
                                />
                            </button>
                        </div>

                        <div className="relative">
                            <button type="button">
                                <i className="fa fa-search text-orange-300 hover:text-red-500 text-lg"></i>
                            </button>
                        </div>

                        <div>
                            <img
                                src="https://randomuser.me/api/portraits/men/32.jpg"
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full border-2 border-orange-400 cursor-pointer"
                            />
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-orange-300 hover:text-red-500 transition font-medium"
                        >
                            <FiLogOut className="text-xl" />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </header>
        </div>
    );
};
