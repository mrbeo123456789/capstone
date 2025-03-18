import React from "react";
import { useNavigate } from "react-router-dom";

const YourChallenge = () => {
    const navigate = useNavigate();

    const invitations = [
        { id: 1, inviter: "User1", challenge: "Challenge B" },
        { id: 2, inviter: "User2", challenge: "Challenge C" },
    ];

    const joinedChallenges = [
        { id: 1, name: "Challenge A", status: "rating", value: 4.5, image: "https://exerciseright.com.au/wp-content/uploads/2020/05/image-from-rawpixel-id-2107431-jpeg-compressed.jpg" },
        { id: 2, name: "Challenge X", status: "days", value: "2 days left", image: "https://www.theladders.com/wp-content/uploads/exercise-191001-800x450.jpg" },
        { id: 3, name: "Challenge Y", status: "on-going", image: "https://images.squarespace-cdn.com/content/v1/603a73e7e541b709395810f2/1701721840754-V0GOQTIPSNBDTVD2ECJW/image-asset.jpeg" },
        { id: 4, name: "Challenge Z", status: "on-going", image: "https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-1626192387.jpg?c=original" },
        { id: 5, name: "Challenge N", status: "rating", value: 3.8, image: "https://hips.hearstapps.com/hmg-prod/images/gym-workout-66d087d56ef90.jpg?crop=0.628xw:1.00xh;0.100xw,0&resize=1200:*" },
        { id: 6, name: "Challenge M", status: "days", value: "15 days left", locked: true, image: "https://www.cnet.com/a/img/resize/c3a00bfb2ce9fbfa0c2285db0943e433b08250b9/hub/2019/12/18/98fd63aa-d21b-49db-b0d9-570be082efed/wellness-stock-16.jpg?auto=webp&fit=crop&height=675&width=1200" },
    ];

    const [activeTab, setActiveTab] = React.useState("host");

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
                            <div className="h-24 bg-gray-200 rounded" />
                            <p className="font-medium">{invite.challenge}</p>
                            <div className="flex gap-2">
                                <button
                                    className="bg-green-600 text-white px-3 py-1 rounded"
                                    onClick={(e) => { e.stopPropagation(); /* Handle Accept */ }}
                                >
                                    Accept
                                </button>
                                <button
                                    className="border px-3 py-1 rounded"
                                    onClick={(e) => { e.stopPropagation(); /* Handle Decline */ }}
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
                            onClick={() => navigate(`/challenges/joins/detail/${challenge.id}`)}
                            className="cursor-pointer min-w-[150px] border rounded-lg flex flex-col items-center relative flex-shrink-0 hover:shadow-lg transition"
                        >
                            <div className="relative w-full h-24 mb-2">
                                <img
                                    src={challenge.image}
                                    alt={challenge.name}
                                    className="w-full h-full object-cover rounded"
                                />
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
