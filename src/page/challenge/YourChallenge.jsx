import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMyChallengesMutation } from "../../service/challengeService.js";
import { useGetMyInvitationsQuery, useRespondInvitationMutation } from "../../service/invitationService.js";

const YourChallenge = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("All");

    const [getMyChallenges, { data: joinedChallenges = [], isLoading }] = useGetMyChallengesMutation();
    const { data: invitations = [], isLoading: isInvitationsLoading } = useGetMyInvitationsQuery();
    const [respondInvitation] = useRespondInvitationMutation();

    const themeColor = "#FF5733";

    useEffect(() => {
        getMyChallenges(activeTab.toUpperCase());
    }, [activeTab]);

    const handleRespond = async (invitationId, accept) => {
        try {
            await respondInvitation({ invitationId, accept }).unwrap();
            alert(accept ? "Invitation accepted!" : "Invitation declined!");
        } catch (error) {
            console.error("Failed to respond to invitation:", error);
            alert("Failed to respond. Try again.");
        }
    };

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
                <h2 className="text-lg font-semibold">Invitations ({invitations.length})</h2>
                {isInvitationsLoading ? (
                    <p>Loading invitations...</p>
                ) : invitations.length === 0 ? (
                    <div className="h-52 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                        <div>
                            {/* Keep your SVG exactly here */}
                            <svg viewBox="0 0 500 400">
                                <path d="M150,50 L350,50 L350,350 L150,350 Z" fill="#fff" stroke="#ddd" strokeWidth="3" />
                                <path d="M175,80 L325,80 M175,120 L325,120 M175,160 L275,160 M175,200 L250,200"
                                      stroke="#eee" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="320" cy="230" r="70" fill="#fff" stroke={themeColor} strokeWidth="8" />
                                <circle cx="320" cy="230" r="60" fill="none" stroke={themeColor} strokeWidth="3" strokeOpacity="0.5" />
                                <line x1="375" y1="280" x2="420" y2="330" stroke={themeColor} strokeWidth="12" strokeLinecap="round" />
                                <text x="320" y="260" fontSize="80" textAnchor="middle" fill={themeColor} fontWeight="bold">?</text>
                                <circle cx="220" cy="260" r="40" fill="#FFF0E6" stroke={themeColor} strokeWidth="2" strokeOpacity="0.5" />
                                <circle cx="205" cy="250" r="4" fill="#666" />
                                <circle cx="235" cy="250" r="4" fill="#666" />
                                <path d="M200,275 Q220,265 240,275" fill="none" stroke="#666" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <p className="font-semibold">You have no challenge invites</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-2">
                        {invitations.map((invite) => (
                            <div
                                key={invite.id}
                                className="cursor-pointer min-w-[200px] p-4 border rounded-lg space-y-2 flex-shrink-0 hover:shadow-lg transition"
                            >
                                <p className="text-sm">{invite.inviterInfo} invites you to:</p>
                                <div className="h-24 bg-gray-200 rounded overflow-hidden">
                                    <img
                                        src={invite.challengeImage || "https://via.placeholder.com/300x200"}
                                        alt={invite.challengeName}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                <p className="font-medium">{invite.challengeName}</p>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.id, true);
                                        }}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="border px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.id, false);
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

            {/* Filter Tabs */}
            <div className="flex gap-4">
                {["All", "host", "cohost", "member"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg ${activeTab === tab ? "bg-blue-600 text-white" : "border"}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Joined Challenges */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Joined Challenges</h2>
                {isLoading ? (
                    <p>Loading challenges...</p>
                ) : joinedChallenges.length === 0 ? (
                    <div className="h-52 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                        <div>
                            <p className="font-semibold">You haven't joined any challenge</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {joinedChallenges.map((challenge) => (
                            <div
                                key={challenge.id}
                                onClick={() => navigate(`/challenges/joins/detail/${challenge.id}`)}
                                className="cursor-pointer min-w-[175px] max-w-[175px] max-h-[200px] border rounded-lg flex flex-col items-center relative flex-shrink-0 hover:shadow-lg transition"
                            >
                                <div className="relative w-full h-24 mb-2">
                                    <img
                                        src={challenge.picture || "https://via.placeholder.com/300x200"}
                                        alt={challenge.name}
                                        className="w-full h-full object-cover rounded"
                                    />
                                    {challenge.role === "HOST" && (
                                        <span className="absolute top-2 left-2 text-yellow-400 text-xl drop-shadow-md">👑</span>
                                    )}
                                </div>
                                <p className="font-medium text-center mb-2 overflow-hidden">{challenge.name}</p>
                                {(() => {
                                    const { text, bg, textColor } = getStatusStyle(challenge.status);
                                    return (
                                        <div className={`${bg} ${textColor} text-xs px-2 py-1 rounded mb-1`}>
                                            {text}
                                        </div>
                                    );
                                })()}
                                <div className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mt-auto mb-2">
                                    {challenge.role}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default YourChallenge;
