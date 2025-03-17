import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4 shadow-md fixed w-full top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* 🔥 Logo */}
                <div className="text-yellow-400 text-xl font-bold">LOGO</div>

                {/* 🌐 Navigation Links */}
                <ul className="flex space-x-6 text-gray-300 font-semibold">
                    <li>
                        <NavLink
                            to="/admin-challengelist"
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md transition duration-200 ${
                                    isActive ? "bg-red-500 text-white" : "hover:bg-gray-700"
                                }`
                            }
                        >
                            Challenge List
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin-userlist"
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md transition duration-200 ${
                                    isActive ? "bg-yellow-500 text-white" : "hover:bg-gray-700"
                                }`
                            }
                        >
                            User List
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin-evidencelist"
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md transition duration-200 ${
                                    isActive ? "bg-orange-500 text-white" : "hover:bg-gray-700"
                                }`
                            }
                        >
                            Evidence List
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin-reportlist"
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md transition duration-200 ${
                                    isActive ? "bg-red-500 text-white" : "hover:bg-gray-700"
                                }`
                            }
                        >
                            Report List
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/create-challenge"
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-md transition duration-200 ${
                                    isActive ? "bg-green-500 text-white" : "hover:bg-gray-700"
                                }`
                            }
                        >
                            Create Challenge
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
