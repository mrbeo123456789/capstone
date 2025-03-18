import React from "react";
import { FaRunning, FaUsers, FaUser, FaLock, FaTrophy, FaChartBar, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";

export const SideBar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: "My Challenge", icon: <FaRunning />, link: "/challenges/joins" },
        { name: "My Group", icon: <FaUsers />, link: "/groups/joins" },
        { name: "Profile", icon: <FaUser />, link: "/profile" },
        { name: "Password", icon: <FaLock />, link: "/password" },
        { name: "Achievement", icon: <FaTrophy />, link: "/achievement" },
        { name: "Statistics", icon: <FaChartBar />, link: "/statistics" },
    ];

    return (
        <div className="relative z-50">

            {/* Sidebar */}
            <div className={`bg-[rgb(249,198,159)] w-full sm:w-64 h-full top-0 left-0 sm:p-5 transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {/* Logo */}
                <div className="flex items-center space-x-3 mb-6 hidden md:block">
                    <img src="https://via.placeholder.com/40" alt="GoBeyond Logo" className="h-10 rounded-full" />
                    <span className="text-xl font-bold">GoBeyond</span>
                </div>

                {/* Menu Items */}
                <nav className="">
                    <ul className="space-y-4 flex sm:flex-col justify-between">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.link}
                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-orange-600 hover:text-white transition"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="hidden md:block">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};
