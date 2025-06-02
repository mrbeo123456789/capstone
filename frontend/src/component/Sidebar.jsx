import React from "react";
import { FaHome, FaUser, FaTasks, FaUsers, FaTrophy } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="w-64 bg-red-900 p-5 flex flex-col">
            <div className="text-center text-xl font-bold mb-5">Logo</div>
            <nav>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 p-3 cursor-pointer hover:bg-red-800 rounded"><Link to="/" className="flex items-center gap-2"><FaHome /> Homepage</Link></li>
                    <li className="flex items-center gap-2 p-3 cursor-pointer hover:bg-red-800 rounded"><Link to="/profile" className="flex items-center gap-2"><FaUser /> Profile</Link></li>
                    <li className="flex items-center gap-2 p-3 cursor-pointer hover:bg-red-800 rounded"><Link to="/challenges" className="flex items-center gap-2"><FaTasks /> Challenges</Link></li>
                    <li className="flex items-center gap-2 p-3 bg-red-800 rounded"><Link to="/groups" className="flex items-center gap-2"><FaUsers /> Groups</Link></li>
                    <li className="flex items-center gap-2 p-3 cursor-pointer hover:bg-red-800 rounded"><Link to="/achievements" className="flex items-center gap-2"><FaTrophy /> Achievement</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;