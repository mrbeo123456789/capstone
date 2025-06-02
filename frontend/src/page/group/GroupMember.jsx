import React, {useState} from "react";
import { FaUsers, FaExchangeAlt, FaExclamationCircle, FaSignOutAlt } from "react-icons/fa";


const GroupUsers = () => {
    const [activeTab, setActiveTab] = useState("members");

    // Fixed user data with random avatars
    const users = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Member", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
        { id: 3, name: "Michael Brown", email: "michael@example.com", role: "Moderator", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
        { id: 4, name: "Emily Johnson", email: "emily@example.com", role: "Member", avatar: "https://randomuser.me/api/portraits/women/4.jpg" }
    ];

    return (
        <div className="p-6 flex flex-col items-center h-full"
             style={{
                 position: "relative",
                 boxSizing: "border-box",
                 borderRadius: "1em",
                 border: "5px solid transparent",
                 zIndex: "1"
             }}>
            {/* Group Header with Gradient Outline */}

            <div className=" h-full w-full relative p-1 rounded-lg shadow-md w-full"
                 style={{
                     top: 0, right: 0, bottom: 0, left: 0,
                     zIndex: "-1",
                     margin: "-5px",
                     borderRadius: "inherit",
                     background: "linear-gradient(to right, red, orange)"
                 }}>
                <div className="bg-black flex flex-col w-full rounded-lg shadow-md items-center"
                     style={{
                         borderRadius: "1em",
                     }}>
                    {/* Gradient Border Effect */}
                    <div>
                        <div className="p-1 rounded-lg flex items-center">
                            {/* Group Image */}
                            <div className="w-24 h-24 bg-gray-300 flex items-center justify-center rounded-lg">
                                <img src="https://source.unsplash.com/200x200/?team,group" alt="Group"
                                     className="w-full h-full object-cover rounded-lg"/>
                            </div>
                            {/* Group Details */}
                            <div className="ml-4 flex-1 text-white">
                                <h2 className="text-xl font-bold">Group Name</h2>
                                <p className="text-sm text-gray-400">Short group description goes here...</p>

                                {/* Action Icons */}
                                <div className="flex items-center gap-4 mt-2">
                                    <FaUsers className="text-xl cursor-pointer hover:text-red-500"/>
                                    <FaExchangeAlt className="text-xl cursor-pointer hover:text-yellow-500"/>
                                    <FaExclamationCircle className="text-xl cursor-pointer hover:text-orange-500"/>
                                    <FaSignOutAlt className="text-xl cursor-pointer hover:text-red-700"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Navigation Tabs */}
                    <div className="flex mt-8 border-b-2 border-gray-300 w-full max-w-4xl">
                        {["Ranking", "Members", "Challenge"].map(tab => (
                            <button
                                key={tab}
                                className={`flex-1 p-2 text-center font-bold ${activeTab === tab.toLowerCase() ? "bg-deep-orange-400 text-white" : "hover:bg-orange-400 bg-orange-200"}`}
                                onClick={() => setActiveTab(tab.toLowerCase())}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    {/* Tab Content */}
                    <div className="bg-orange-100 shadow-lg rounded-lg p-6 w-full max-w-4xl my-4">
                        {activeTab === "members" && (
                            <>
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead className="bg-orange-500 text-white">
                                    <tr>
                                        <th className="border border-gray-300 p-2">#</th>
                                        <th className="border border-gray-300 p-2">Avatar</th>
                                        <th className="border border-gray-300 p-2">Name</th>
                                        <th className="border border-gray-300 p-2">Email</th>
                                        <th className="border border-gray-300 p-2">Role</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-yellow-200 transition">
                                            <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <img src={user.avatar} alt={user.name}
                                                     className="w-10 h-10 rounded-full mx-auto"/>
                                            </td>
                                            <td className="border border-gray-300 p-2">{user.name}</td>
                                            <td className="border border-gray-300 p-2">{user.email}</td>
                                            <td className="border border-gray-300 p-2">{user.role}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                        {activeTab === "ranking" && (
                            <div className="text-center text-gray-600">🏆 Ranking Tab Coming Soon!</div>
                        )}
                        {activeTab === "challenge" && (
                            <div className="text-center text-gray-600">🔥 Challenge Tab Coming Soon!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupUsers;
