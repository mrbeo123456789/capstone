import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useGetGroupsQuery,
    useGetPendingInvitationsQuery,
    useRespondToInvitationMutation
} from "../../service/groupService.js";

const YourGroup = () => {
    const navigate = useNavigate();
    const { data: groupsData, isLoadingddd, isError } = useGetGroupsQuery();

    const { data: invitationsData = [], isLoading, error } = useGetPendingInvitationsQuery();
    console.log(invitationsData)

    const [respondToInvitation] = useRespondToInvitationMutation();

    const handleRespond = async (groupId, status) => {
        try {
            const res = await respondToInvitation({ groupId, status }).unwrap();
            alert(res); // success message from backend
        } catch (error) {
            console.error("Failed to respond to invitation:", error);
            alert("Có lỗi xảy ra.");
        }
    };

    const [activeTab, setActiveTab] = useState("All");

    const filteredGroups = (groupsData || []).filter(group => {
        if (activeTab === "All") return true;
        if (activeTab === "leader") return group.currentMemberRole === "HOST" || group.currentMemberRole === "COHOST";
        if (activeTab === "member") return group.currentMemberRole === "MEMBER";
        return true;
    });


    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Top Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => navigate("/groups/create")}
                >
                    Create a group
                </button>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search Groups"
                        className="border rounded-lg px-3 py-2 w-48"
                    />
                    <button className="border px-3 py-2 rounded-lg">Filter ▼</button>
                </div>
            </div>

            {/* Invitations */}
            <div className="border rounded-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold">Group Invitations ({invitationsData.length})</h2>
                {invitationsData.length === 0 ? (
                    <div className="h-52 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400">
                                <path d="M150,50 L350,50 L350,350 L150,350 Z" fill="#fff" stroke="#ddd"
                                      stroke-width="3"></path>
                                <path d="M175,80 L325,80 M175,120 L325,120 M175,160 L275,160 M175,200 L250,200"
                                      stroke="#eee" stroke-width="5" stroke-linecap="round"></path>
                                <circle cx="320" cy="230" r="70" fill="#fff" stroke="#FF8A3D" stroke-width="8"></circle>
                                <circle cx="320" cy="230" r="60" fill="none" stroke="#FFC097" stroke-width="3"></circle>
                                <line x1="375" y1="280" x2="420" y2="330" stroke="#FF8A3D" stroke-width="12"
                                      stroke-linecap="round"></line>
                                <text x="320" y="260" font-size="80" text-anchor="middle" fill="#FF8A3D"
                                      font-weight="bold">?
                                </text>
                                <circle cx="220" cy="260" r="40" fill="#FFF0E6" stroke="#FFC097"
                                        stroke-width="2"></circle>
                                <circle cx="205" cy="250" r="4" fill="#666"></circle>
                                <circle cx="235" cy="250" r="4" fill="#666"></circle>
                                <path d="M200,275 Q220,265 240,275" fill="none" stroke="#666" stroke-width="3"
                                      stroke-linecap="round"></path>
                            </svg>
                            <p className="font-semibold">You have no group invites</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-2">
                        {invitationsData.map((invite) => (
                            <div
                                key={invite.id}
                                onClick={() => navigate(`/groups/detail/${invite.id}`)}
                                className="cursor-pointer min-w-[200px] p-4 border rounded-lg space-y-2 flex-shrink-0 hover:shadow-lg transition">
                                <p className="text-sm">{invite.inviter} invites you to join</p>
                                <div className="h-24 bg-gray-200 rounded">
                                    <img
                                        src={invite.img || "https://via.placeholder.com/300x200"}
                                        alt={invite.name}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                <p className="font-medium">{invite.group}</p>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.groupId, "ACCEPTED");
                                        }}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="border px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.groupId, "REJECTED");
                                        }}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex gap-4">
                {['All', 'leader', 'member'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg ${activeTab === tab ? 'bg-blue-600 text-white' : 'border'}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Joined Groups */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Your Groups</h2>
                {filteredGroups?.length === 0 ? (
                    <div className="h-52 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                        <div>
                            <p className="font-semibold">You haven't joined any group</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {filteredGroups.map((group) => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/groups/joins/${group.id}`)}
                                className="cursor-pointer min-w-[150px] border rounded-lg flex flex-col items-center relative flex-shrink-0 hover:shadow-lg transition">
                                <div className="relative w-full h-24 mb-2">
                                    <img
                                        src={group.picture || "https://via.placeholder.com/300x200"}
                                        alt={group.name}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                <p className="font-medium text-center mb-2">{group.name}</p>
                                <div className="bg-gray-100 text-sm px-2 py-1 rounded mb-1">
                                    {group.currentParticipants || group.members?.length || 0} members
                                </div>
                                <div className="border text-sm px-2 py-1 rounded capitalize">
                                    {group.currentMemberRole?.toLowerCase()}
                                </div>
                            </div>
                        ))}
                        {isLoading && <p className="text-center">Loading groups...</p>}
                        {isError && <p className="text-center text-red-500">Failed to load groups.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default YourGroup;