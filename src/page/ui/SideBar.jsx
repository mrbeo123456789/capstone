import React, { useState } from "react";
import { FaRunning, FaUsers, FaUser, FaLock, FaTrophy, FaChartBar, FaBars, FaTimes } from "react-icons/fa";

export const SideBar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { name: "My Challenge", icon: <FaRunning />, link: "/challenges/joins" },
        { name: "My Group", icon: <FaUsers />, link: "/groups/joins" },
        { name: "Profile", icon: <FaUser />, link: "/profile" },
        { name: "Password", icon: <FaLock />, link: "/password" },
        { name: "Achievement", icon: <FaTrophy />, link: "/achievement" },
        { name: "Statistics", icon: <FaChartBar />, link: "/statistics" },
    ];

    return (
        <div className="relative hidden my-4 ml-4 shadow-lg lg:block w-80 h-full">
            {/* Sidebar */}
            <div className={`rounded-lg bg-[#370F0F] text-orange-300 w-64 h-full top-0 left-0 p-5 transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
                {/* Logo */}
                <div className="flex items-center space-x-3 mb-6">
                    <img src="https://via.placeholder.com/40" alt="GoBeyond Logo" className="h-10 rounded-full" />
                    <span className="text-xl font-bold">GoBeyond</span>
                </div>

                {/* Menu Items */}
                <nav>
                    <ul className="space-y-4">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <a
                                    href={item.link}
                                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-orange-600 hover:text-white transition"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
};
