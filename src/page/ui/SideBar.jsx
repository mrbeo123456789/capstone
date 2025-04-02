import React from "react";
import { FaRunning, FaUsers, FaUser, FaLock, FaTrophy, FaChartBar } from "react-icons/fa";
import { Link } from "react-router-dom";

export const SideBar = ({ isOpen }) => {
    const menuItems = [
        { name: "My Challenge", icon: <FaRunning />, link: "/challenges/joins" },
        { name: "My Group", icon: <FaUsers />, link: "/groups/joins" },
        { name: "Profile", icon: <FaUser />, link: "/profile" },
        { name: "Password", icon: <FaLock />, link: "/password" },
        { name: "Achievement", icon: <FaTrophy />, link: "/achievement" },
        { name: "Statistics", icon: <FaChartBar />, link: "/statistics" },
    ];

    return (
        <div className={`top-0 left-0 h-screen w-64 z-40 bg-[rgb(249,198,159)] p-5 shadow-md flex flex-col justify-between`}>
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-6 hidden md:block">
                <img src="https://via.placeholder.com/40" alt="GoBeyond Logo" className="h-10 rounded-full" />
                <span className="text-xl font-bold">GoBeyond</span>
            </div>

            {/* Menu Items */}
            <nav className="">
                <ul className="space-y-4">
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
    );
};


