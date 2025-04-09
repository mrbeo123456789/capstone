import React from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    FaRunning,
    FaUsers,
    FaUser,
    FaLock,
    FaTrophy,
    FaChartBar,
} from "react-icons/fa";

const Sidebar = ({ isOpen }) => {
    const { t } = useTranslation();

    const menuItems = [
        { key: "myChallenge", icon: <FaRunning />, link: "/challenges/joins" },
        { key: "myGroup", icon: <FaUsers />, link: "/groups/joins" },
        { key: "profile", icon: <FaUser />, link: "/profile" },
        { key: "password", icon: <FaLock />, link: "/password" },
        { key: "achievement", icon: <FaTrophy />, link: "/achievement" },
        { key: "statistics", icon: <FaChartBar />, link: "/statistics" },
    ];

    return (
        <aside
            className={clsx(
                "fixed top-20 bottom-0 left-0 w-14 md:w-64 z-40 transition-transform duration-300 overflow-y-auto",
                {
                    "-translate-x-full": !isOpen,
                    "translate-x-0": isOpen,
                }
            )}
        >
            <div className="p-5 flex flex-col h-full justify-between backdrop-blur-md bg-white/10 shadow-lg border-r border-white/20">
                {/* Menu Section */}
                <nav className="flex-1">
                    <ul className="space-y-4">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={item.link}
                                    className="flex md:flex-row flex-col items-center md:items-start space-y-1 md:space-y-0 md:space-x-3 p-2 rounded-md hover:bg-orange-600 hover:text-white transition text-white"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="hidden md:inline">{t(`sidebar.${item.key}`)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logo Section at Bottom */}
                <div className="flex flex-col items-center mt-6">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/logo%2Fimage-removebg-preview.png?alt=media&token=f16618d4-686c-4014-a9cc-99b4cf043c86"
                        alt="GoBeyond Logo"
                        className="h-10 rounded-full"
                    />
                    <div className="flex mt-2">
                        <div className="text-lg font-bold text-white">Go</div>
                        <div className="text-lg font-bold text-yellow-400">Beyond</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
