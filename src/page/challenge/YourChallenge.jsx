import React from "react";

const YourChallenge = () => {
    const invitations = [
        { id: 1, inviter: "User1", challenge: "Challenge B" },
        { id: 2, inviter: "User2", challenge: "Challenge C" },
    ];

    const joinedChallenges = [
        { id: 1, name: "Challenge A", status: "rating", value: 4.5 },
        { id: 2, name: "Challenge X", status: "days", value: "2 days left" },
        { id: 3, name: "Challenge Y", status: "on-going" },
        { id: 4, name: "Challenge Z", status: "on-going" },
        { id: 5, name: "Challenge N", status: "rating", value: 3.8 },
        { id: 6, name: "Challenge M", status: "days", value: "15 days left", locked: true },
    ];

    const [activeTab, setActiveTab] = React.useState("host");

    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Top Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create a challenge</button>
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
                            className="min-w-[200px] p-4 border rounded-lg space-y-2 flex-shrink-0"
                        >
                            <p className="text-sm">{invite.inviter} invite you to a challenge</p>
                            <div className="h-24 bg-gray-200 rounded" />
                            <p className="font-medium">{invite.challenge}</p>
                            <div className="flex gap-2">
                                <button className="bg-green-600 text-white px-3 py-1 rounded">Accept</button>
                                <button className="border px-3 py-1 rounded">Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4">
                {["host", "cohost", "member"].map((tab) => (
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
                            className="min-w-[150px] border rounded-lg p-2 flex flex-col items-center relative flex-shrink-0"
                        >
                            <div className="h-24 w-full bg-gray-200 rounded mb-2 relative flex items-center justify-center">
                                {challenge.locked && (
                                    <span className="absolute top-2 right-2 text-gray-600">🔒</span>
                                )}
                            </div>
                            <p className="font-medium text-center mb-2">{challenge.name}</p>
                            {challenge.status === "rating" && (
                                <div className="flex items-center gap-1 text-sm bg-pink-100 px-2 py-1 rounded">
                                    ⭐ {challenge.value}
                                </div>
                            )}
                            {challenge.status === "days" && (
                                <div className="bg-yellow-100 text-sm px-2 py-1 rounded">{challenge.value}</div>
                            )}
                            {challenge.status === "on-going" && (
                                <div className="border text-sm px-2 py-1 rounded">On-going</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default YourChallenge;
