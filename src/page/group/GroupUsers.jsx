import { useState } from "react";
import GroupHeader from "./GroupHeader";
import MemberTable from "./MemberTable";
import {IoCloudUploadOutline} from "react-icons/io5";

const GroupUsers = () => {
    const [activeTab, setActiveTab] = useState("members");

    const users = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Member", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
        { id: 3, name: "Michael Brown", email: "michael@example.com", role: "Moderator", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
        { id: 4, name: "Emily Johnson", email: "emily@example.com", role: "Member", avatar: "https://randomuser.me/api/portraits/women/4.jpg" }
    ];

    return (
            <div className="w-full sm:grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <GroupHeader/>
                </div>

                <div className="col-span-2">
                    {/* Tab Content */}
                    {/* Tabs */}
                    <div className="flex mt-8 border-b-2 border-gray-300 w-full mx-auto">
                        {["Ranking", "Members", "Challenge"].map(tab => (
                            <button
                                key={tab}
                                className={`flex-1 p-2 text-center font-bold ${
                                    activeTab === tab.toLowerCase() ? "bg-orange-500 text-white" : "hover:bg-orange-400 bg-orange-200"
                                }`}
                                onClick={() => setActiveTab(tab.toLowerCase())}>
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="bg-orange-100 shadow-lg rounded-lg w-full mx-auto my-4">
                        {activeTab === "members" && <MemberTable users={users}/>}
                        {activeTab === "ranking" && (
                            <div className="text-center text-gray-600">🏆 Ranking Tab Coming Soon!</div>
                        )}
                        {activeTab === "challenge" && (
                            <div className="text-center text-gray-600">🔥 Challenge Tab Coming Soon!</div>
                        )}
                    </div>
                </div>
            </div>
    );
};

export default GroupUsers;
