import React, { useState } from "react";
import { FaSearch, FaBell, FaPlus, FaUserCircle } from "react-icons/fa";

const GroupList = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // 🔹 Sample Group Data with Static Placeholder Images
    const placeholderImage = "https://via.placeholder.com/50"; // Use a reliable placeholder

    const invitations = [
        { id: 1, user: "User1", groupName: "Group X", avatar: placeholderImage },
    ];
    const yourGroups = [
        { id: 1, name: "Group A", avatar: placeholderImage },
    ];
    const joinedGroups = [
        { id: 1, name: "Group 1", avatar: placeholderImage },
        { id: 2, name: "Group 2", avatar: placeholderImage },
        { id: 3, name: "Group 3", avatar: placeholderImage },
    ];

    return (
        <div className="bg-gray-900 min-h-screen text-white flex">
            {/* 📌 Sidebar Navigation */}
            <div className="w-64 bg-red-900 p-4 flex flex-col">
                <div className="text-center text-xl font-bold mb-4">LOGO</div>
                <nav>
                    <ul className="space-y-2">
                        <li className="p-3 cursor-pointer hover:bg-red-800 rounded">🏠 Homepage</li>
                        <li className="p-3 cursor-pointer hover:bg-red-800 rounded">👤 Profile</li>
                        <li className="p-3 cursor-pointer hover:bg-red-800 rounded">🏆 Challenges</li>
                        <li className="p-3 bg-red-800 rounded">👥 Groups</li>
                        <li className="p-3 cursor-pointer hover:bg-red-800 rounded">🥇 Achievement</li>
                        <li className="p-3 cursor-pointer hover:bg-red-800 rounded">📊 Statistic</li>
                    </ul>
                </nav>
            </div>

            {/* 📌 Main Content */}
            <div className="flex-1 p-6">
                {/* 🔍 Top Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-4">
                        <button className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded">Challenge</button>
                        <button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded">Leaderboard</button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <FaSearch className="text-gray-300 cursor-pointer" />
                        <FaBell className="text-gray-300 cursor-pointer" />
                        <FaUserCircle className="text-gray-300 cursor-pointer text-2xl" />
                    </div>
                </div>

                {/* 🔍 Search Bar & Create Group Button */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="🔍 Search"
                            className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center">
                        <FaPlus className="mr-2" /> Create a new group
                    </button>
                </div>

                {/* 📩 Invitations */}
                {invitations.length > 0 && (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                        <h3 className="text-yellow-400 font-bold mb-3">Invitations ({invitations.length})</h3>
                        {invitations.map((invite) => (
                            <div key={invite.id} className="flex justify-between items-center bg-gray-700 p-3 rounded mb-2">
                                <div className="flex items-center gap-3">
                                    <img src={invite.avatar} alt="Group Avatar" className="w-10 h-10 rounded-full" />
                                    <span>{invite.user} invites you to <strong>{invite.groupName}</strong></span>
                                </div>
                                <div className="space-x-2">
                                    <button className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded">Accept</button>
                                    <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 🏆 Your Groups */}
                <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-orange-400 font-bold mb-3">Your Groups</h3>
                    <div className="flex flex-wrap gap-4">
                        {yourGroups.map((group) => (
                            <div key={group.id} className="flex flex-col items-center bg-red-700 p-4 rounded text-center w-40">
                                <img src={group.avatar} alt="Group Avatar" className="w-12 h-12 rounded-full mb-2" />
                                {group.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔹 Joined Groups */}
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-yellow-400 font-bold mb-3">Joined Groups</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {joinedGroups.map((group) => (
                            <div key={group.id} className="flex flex-col items-center bg-orange-600 p-4 rounded text-center">
                                <img src={group.avatar} alt="Group Avatar" className="w-12 h-12 rounded-full mb-2" />
                                {group.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupList;
