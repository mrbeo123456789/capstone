import { useState } from "react";
import GroupHeader from "./GroupHeader";
import MemberTable from "./MemberTable";
import {IoCloudUploadOutline} from "react-icons/io5";
import {useGetGroupDetailQuery} from "../../service/groupService.js";
import {useParams} from "react-router-dom";

const GroupUsers = () => {
    const [activeTab, setActiveTab] = useState("members");
    const { id: groupId } = useParams();

    const { data: group, isLoading, error } = useGetGroupDetailQuery(groupId);

    if (isLoading) return <p className="text-center">Loading group data...</p>;
    if (error) return <p className="text-center text-red-500">Failed to load group.</p>;

    const users = group?.members?.map((member) => ({
        id: member.memberId,
        name: member.memberName,
        email: `user${member.memberId}@example.com`,
        avatar: member.imageUrl,
        role: member.role,
        status: member.status,
        joinDate: member.joinDate
    })) || [];

    return (
        <div className="w-full">
            <div className="">
                <GroupHeader group={group} />
            </div>
            <div className="">
                <div className="flex mt-8 border-b-2 border-gray-300 w-full mx-auto">
                    {["Ranking", "Members", "Challenge"].map(tab => (
                        <button
                            key={tab}
                            className={`flex-1 p-2 text-center font-bold ${
                                activeTab === tab.toLowerCase()
                                    ? "bg-orange-500 text-white"
                                    : "hover:bg-orange-400 bg-orange-200"
                            }`}
                            onClick={() => setActiveTab(tab.toLowerCase())}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-orange-100 shadow-lg rounded-lg w-full mx-auto my-4">
                    {activeTab === "members" && <MemberTable users={users} />}
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
