import React from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import {
    FaRunning,
    FaUsers,
    FaUser,
    FaLock,
    FaTrophy,
    FaChartBar,
} from "react-icons/fa";

const Sidebar = ({ isOpen }) => {
    const menuItems = [
        { name: "My Challenge", icon: <FaRunning />, link: "/challenges/joins" },
        { name: "My Group", icon: <FaUsers />, link: "/groups/joins" },
        { name: "Profile", icon: <FaUser />, link: "/profile" },
        { name: "Password", icon: <FaLock />, link: "/password" },
        { name: "Achievement", icon: <FaTrophy />, link: "/achievement" },
        { name: "Statistics", icon: <FaChartBar />, link: "/statistics" },
    ];

    return (
        <aside
            className={clsx(
                "fixed top-20 bottom-0 left-0 w-14 md:w-64 z-40 transition-transform duration-300 overflow-y-auto content-center",
                {
                    "-translate-x-full": !isOpen,
                    "translate-x-0": isOpen,
                }
            )}
        >
            <div className="p-5 flex flex-col h-[95%] rounded-2xl justify-between backdrop-blur-md bg-white/10 shadow-lg border-b border-white/20">
                {/* Logo */}
                <div className="items-center space-x-3 mb-6 hidden md:flex">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                        alt="GoBeyond Logo"
                        className="h-10 rounded-full"
                    />
                    <div className="flex">
                        <div className="text-xl font-bold text-white">Go</div>
                        <div className="text-xl font-bold text-yellow-400">Beyond</div>
                    </div>

                </div>

                {/* Menu */}
                <nav className="flex-1">
                    <ul className="space-y-4">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.link}
                                    className="flex md:flex-row flex-col items-center md:items-start space-y-1 md:space-y-0 md:space-x-3 p-2 rounded-md hover:bg-orange-600 hover:text-white transition text-white"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="hidden md:inline">{item.name}</span>
                                </Link>

                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
