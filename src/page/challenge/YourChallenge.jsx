import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {useGetMyChallengesMutation} from "../../service/challengeService.js";

const YourChallenge = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("All");

    const [getMyChallenges, { data: joinedChallenges = [], isLoading }] = useGetMyChallengesMutation();

    useEffect(() => {
        getMyChallenges(activeTab.toUpperCase());
    }, [activeTab]);

    console.log(joinedChallenges);

    const invitations = [
        { id: 1, inviter: "User1", challenge: "Challenge B" },
        { id: 2, inviter: "User2", challenge: "Challenge C" },
    ];

    // 💡 Đặt ở đầu file hoặc phía trên component
    const getStatusStyle = (status) => {
        switch (status) {
            case "APPROVED":
                return { text: "Approved", bg: "bg-green-100", textColor: "text-green-700" };
            case "PENDING":
                return { text: "Pending", bg: "bg-gray-200", textColor: "text-gray-600" };
            case "REJECTED":
                return { text: "Rejected", bg: "bg-red-100", textColor: "text-red-700" };
            case "CANCELED":
                return { text: "Canceled", bg: "bg-yellow-100", textColor: "text-yellow-800" };
            default:
                return { text: status, bg: "bg-gray-100", textColor: "text-gray-700" };
        }
    };


    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Top Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => navigate("/challenges/create")}
                >
                    Create a challenge
                </button>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search"
                        className="border rounded-lg px-3 py-2 w-48"
                    />
                    <button className="border px-3 py-2 rounded-lg">Filter ▼</button>
                </div>
            </div>

            {/* Invitations */}
            <div className="border rounded-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold">Invitation ({invitations.length})</h2>
                <div className="flex gap-6 overflow-x-auto pb-2">
                    {invitations.map((invite) => (
                        <div
                            key={invite.id}
                            onClick={() => navigate(`/challenges/detail/${invite.id}`)} // <-- Navigate to detail
                            className="cursor-pointer min-w-[200px] p-4 border rounded-lg space-y-2 flex-shrink-0 hover:shadow-lg transition"
                        >
                            <p className="text-sm">{invite.inviter} invite you to a challenge</p>
                            <div className="h-24 bg-gray-200 rounded"/>
                            <p className="font-medium">{invite.challenge}</p>
                            <div className="flex gap-2">
                                <button
                                    className="bg-green-600 text-white px-3 py-1 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation(); /* Handle Accept */
                                    }}
                                >
                                    Accept
                                </button>
                                <button
                                    className="border px-3 py-1 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation(); /* Handle Decline */
                                    }}
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4">
                {["All", "host", "cohost", "member"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg ${
                            activeTab === tab ? "bg-blue-600 text-white" : "border"
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Joined Challenges */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Joined challenges</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {joinedChallenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            onClick={() => navigate(`/challenges/joins/detail/${challenge.id}`)}
                            className="cursor-pointer min-w-[150px] border rounded-lg flex flex-col items-center relative flex-shrink-0 hover:shadow-lg transition"
                        >
                            <div className="relative w-full h-24 mb-2">
                                <img
                                    src={challenge?.picture}
                                    alt={challenge.name}
                                    className="w-full h-full object-cover rounded"
                                />
                                {/* 👑 Crown Icon for Host */}
                                {challenge.role === "HOST" && (
                                    <span
                                        className="absolute top-2 left-2 text-yellow-400 text-xl drop-shadow-md">👑</span>
                                )}
                            </div>

                            {/* Challenge Name */}
                            <p className="font-medium text-center mb-2">{challenge.name}</p>

                            {(() => {
                                const { text, bg, textColor } = getStatusStyle(challenge.status);
                                return (
                                    <div className={`${bg} ${textColor} text-xs px-2 py-1 rounded mb-1`}>
                                        {text}
                                    </div>
                                );
                            })()}



                            {/* Role Display */}
                            <div className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mt-auto mb-2">
                                {challenge.role}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default YourChallenge;
