import React, { useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import ProofUploads from "./ProofUploads";
import RankingList from "./RankingList";
import VoteOther from "./VoteOther";
import MemberListPopup from "../ui/MemberListPopup.jsx";
import {useParams} from "react-router-dom";
import {useGetChallengeDetailQuery} from "../../service/challengeService.js";
import Description from "./description.jsx";
import ProgressTracking from "./ProgressTracking.jsx";

const JoinedChallengeDetail = () => {
    const [activeTab, setActiveTab] = useState("proof");
    const [showPopup, setShowPopup] = useState(false);

    const { id } = useParams(); // Lấy challenge ID từ URL
    const { data, isLoading, error } = useGetChallengeDetailQuery(id);
    console.log(data)

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading challenge detail</p>;

    const challenge = data;

    const openMemberList = () => {
        console.log("openUserDetail");
        setShowPopup(true);
    };

    const closeUserDetail = () => {
        setShowPopup(false);
    };

    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray)) return "N/A";
        const [year, month, day] = dateArray;
        return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
    };

    return (
        <div className="w-full">
            <div className="mx-auto bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="w-full md:w-3/5">
                        <h2 className="text-2xl font-bold text-gray-900">{challenge?.name}</h2>
                        <p className="text-gray-500 mt-2">
                            {formatDate(challenge?.startDate)} - {formatDate(challenge?.endDate)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                            Thử thách: <span
                            className="text-orange-500 font-semibold">{challenge?.challengeType}</span>
                        </p>
                        <div className="">
                            <ProgressTracking challenge={challenge} />
                        </div>
                    </div>
                    <div className="bg-gray-200 flex items-center justify-center rounded-lg md:w-2/5">
                        <img
                            src={challenge?.picture}
                            alt={challenge?.name}
                            className="w-full h-full object-cover rounded"
                        />
                    </div>
                </div>
                <button className="text-white bg-red-600 px-6 py-2 rounded hover:bg-red-900"
                        onClick={() => openMemberList()}>
                    Invite
                </button>
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
                    <button
                        className={`flex-1 p-2 text-center font-bold ${
                            activeTab === "descriptions" ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-gray-700"
                        }`}
                        onClick={() => setActiveTab("description")}
                    >
                        Description
                    </button>
                </div>
            </div>

            {activeTab === "proof" && <ProofUploads/>}
            {activeTab === "ranking" && <RankingList/>}
            {activeTab === "voteOther" && <VoteOther/>}
            {activeTab === "description" && <Description content={challenge?.description} />}
            {/* User Detail Popup */}
            {showPopup && (
                <MemberListPopup
                    onClose={closeUserDetail}
                />
            )}
        </div>
    );
};

export default JoinedChallengeDetail;
