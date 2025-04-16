import { useState } from "react";
import GroupHeader from "./GroupHeader";
import MemberTable from "./MemberTable";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FaUsers, FaTrophy, FaFire } from "react-icons/fa";
import { useGetGroupDetailQuery } from "../../service/groupService.js";
import { useParams } from "react-router-dom";
import MemberListPopup from "../ui/MemberListPopup.jsx";
import GroupDetailRanking from "./GroupMemberDetail.jsx"; // (You can create it similar to ChallengeInvitePopup)

const JoinedGroupDetail = () => {
    const [activeTab, setActiveTab] = useState("members");
    const [menuOpen, setMenuOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const { id: groupId } = useParams();

    const { data: group, isLoading, error } = useGetGroupDetailQuery(groupId);

    const openInvitePopup = () => setShowPopup(true);
    const closeInvitePopup = () => setShowPopup(false);

    const tabItems = [
        { key: "members", label: "Members", icon: <FaUsers /> },
        { key: "challenge", label: "Challenges", icon: <FaFire /> },
    ];

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
            {/* Group Header */}
            <div className="mx-auto bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="w-full md:pr-6 pb-6 md:pb-0">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">{group?.name}</h2>
                            <div className="relative inline-block text-left mb-4">
                                <button
                                    className="flex flex-col space-y-1 p-2"
                                    onClick={() => setMenuOpen((prev) => !prev)}
                                >
                                    <span className="block w-6 h-1 bg-orange-400"></span>
                                    <span className="block w-6 h-1 bg-orange-400"></span>
                                    <span className="block w-6 h-1 bg-orange-400"></span>
                                </button>

                                {menuOpen && (
                                    <div className="absolute z-10 mt-2 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            <button onClick={openInvitePopup}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                                Invite Members
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                                Leave Group
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                                Report Group
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-500 mt-2">Group Code: <span className="text-orange-600 font-semibold">{group?.code}</span></p>
                        <p className="text-gray-500 mt-1">Created At: {new Date(group?.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-200 flex items-center justify-center rounded-lg">
                        <img
                            src={group?.picture}
                            alt={group?.name}
                            className="w-[120px] h-[120px] rounded"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
                <div className="rounded-lg flex w-full bg-black text-white text-sm font-semibold">
                    {tabItems.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex flex-col sm:flex-row items-center justify-center px-4 py-3 transition-all
                                ${activeTab === tab.key ? "border-t-4 border-red-500 bg-orange-300 text-black" : "bg-white text-black"}
                                hover:bg-orange-100 hover:text-black`}
                        >
                            <span className="text-lg mr-2">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="shadow-lg rounded-lg w-full mx-auto">
                    {activeTab === "membersz" && <MemberTable users={users} />}
                    {activeTab === "members" && <GroupDetailRanking/>}
                    {activeTab === "challenge" && <div className="text-center text-gray-600">🔥 Challenge Tab Coming Soon!</div>}
                </div>
            </div>

            {/* Invite Popup */}
            {showPopup && <MemberListPopup onClose={closeInvitePopup} />}
        </div>
    );
};

export default JoinedGroupDetail;