import { useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import ProofUploads from "./ProofUploads";
import RankingList from "./RankingList";
import VoteOther from "./VoteOther";

const JoinedChallengeDetail = () => {
    const [activeTab, setActiveTab] = useState("proof");
    const progress = 60;

    const challenge = {
        name: "Challenge Name",
        startDate: "01/04/2024",
        endDate: "30/04/2024",
    };

    return (
        <div className="w-full">
            <div className="mx-auto bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="md:w-2/3">
                        <h1 className="text-2xl font-bold text-red-600">{challenge.name}</h1>
                        <p className="text-gray-700">Start Date: {challenge.startDate}</p>
                        <p className="text-gray-700">End Date: {challenge.endDate}</p>
                        <div className="mt-4">
                            <p className="text-gray-700">Progress: {progress}%</p>
                            <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                                <div
                                    className="bg-blue-500 h-3 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="w-40 h-40 bg-gray-200 flex items-center justify-center rounded-lg">
                        <IoCloudUploadOutline className="text-gray-500 text-4xl" />
                    </div>
                </div>
            </div>

            <div className="mt-6 w-full mx-auto">
                <div className="flex border-b-2 border-gray-300">
                    <button
                        className={`flex-1 p-2 text-center font-bold ${
                            activeTab === "proof" ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setActiveTab("proof")}
                    >
                        Proof
                    </button>
                    <button
                        className={`flex-1 p-2 text-center font-bold ${
                            activeTab === "ranking" ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setActiveTab("ranking")}
                    >
                        Ranking
                    </button>
                    <button
                        className={`flex-1 p-2 text-center font-bold ${
                            activeTab === "voteOther" ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setActiveTab("voteOther")}
                    >
                        Vote Other
                    </button>
                </div>
            </div>

            {activeTab === "proof" && <ProofUploads />}
            {activeTab === "ranking" && <RankingList />}
            {activeTab === "voteOther" && <VoteOther />}
        </div>
    );
};

export default JoinedChallengeDetail;
