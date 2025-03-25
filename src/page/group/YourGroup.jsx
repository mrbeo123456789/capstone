import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useGetGroupsQuery} from "../../service/groupService.js";

const YourGroup = () => {
    const navigate = useNavigate();
    const { data: groupsData, isLoading, isError } = useGetGroupsQuery();

    // Sample Data
    const invitations = [
        { id: 1, inviter: "Member1", group: "Group Alpha" },
        { id: 2, inviter: "Member2", group: "Group Beta" },
    ];

    const joinedGroups = [
        { id: 1, name: "Group One", role: "host", members: 10, image: "https://cdn.pixabay.com/photo/2017/01/10/19/05/group-1979268_1280.jpg" },
        { id: 2, name: "Group Two", role: "member", members: 25, image: "https://cdn.pixabay.com/photo/2016/12/06/09/31/team-1882501_1280.jpg" },
        { id: 3, name: "Group Three", role: "cohost", members: 12, image: "https://cdn.pixabay.com/photo/2018/01/19/12/02/group-3094859_1280.jpg" },
        { id: 4, name: "Group Four", role: "member", members: 40, image: "https://cdn.pixabay.com/photo/2018/03/01/14/59/group-3198726_1280.jpg" },
    ];

    const [activeTab, setActiveTab] = useState("host");

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
                <h2 className="text-lg font-semibold">Group Invitations ({invitations.length})</h2>
                <div className="flex gap-6 overflow-x-auto pb-2">
                    {invitations.map((invite) => (
                        <div
                            key={invite.id}
                            onClick={() => navigate(`/groups/detail/${invite.id}`)} // Navigate to group detail
                            className="cursor-pointer min-w-[200px] p-4 border rounded-lg space-y-2 flex-shrink-0 hover:shadow-lg transition">
                            <p className="text-sm">{invite.inviter} invites you to join</p>
                            <div className="h-24 bg-gray-200 rounded" />
                            <p className="font-medium">{invite.group}</p>
                            <div className="flex gap-2">
                                <button
                                    className="bg-green-600 text-white px-3 py-1 rounded"
                                    onClick={(e) => { e.stopPropagation(); /* Handle Accept */ }}>
                                    Accept
                                </button>
                                <button
                                    className="border px-3 py-1 rounded"
                                    onClick={(e) => { e.stopPropagation(); /* Handle Decline */ }}>
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Joined Groups */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Your Groups</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {groupsData && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {groupsData
                                .map((group) => (
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

        </div>
    );
};

export default YourGroup;
