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
import {useGetMyEvidencesByChallengeQuery} from "../../service/evidenceService.js";
import {FaCheckCircle, FaInfoCircle, FaTrophy, FaVoteYea} from "react-icons/fa";

const JoinedChallengeDetail = () => {
    const [activeTab, setActiveTab] = useState("proof");
    const [showPopup, setShowPopup] = useState(false);

    const tabItems = [
        { key: "proof", label: "Proof", icon: <FaCheckCircle /> },
        { key: "ranking", label: "Ranking", icon: <FaTrophy /> },
        { key: "voteOther", label: "Vote Other", icon: <FaVoteYea /> },
        { key: "description", label: "Description", icon: <FaInfoCircle /> },
    ];

    const { id } = useParams(); // Lấy challenge ID từ URL
    const { data, isLoading, error } = useGetChallengeDetailQuery(id);
    const {data: evidenceData, isEvidenceLoading, errorEvidence } = useGetMyEvidencesByChallengeQuery(id);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading challenge detail</p>;

    const challenge = data;

    // Invite Section
    const openMemberList = () => {
        console.log("openUserDetail");
        setShowPopup(true);
    };

    const closeUserDetail = () => {
        setShowPopup(false);
    };
    // ENd of invite section

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
                            <ProgressTracking
                                challenge={challenge}
                                evidence={evidenceData}
                            />
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
                {activeTab === "proof" && (
                    isLoading || isEvidenceLoading ? (
                        <p className="text-center py-4">Loading proof data...</p>
                    ) : (
                        <ProofUploads
                            challenge={challenge}
                            evidence={evidenceData}
                        />
                    )
                )}
                {activeTab === "ranking" && <RankingList/>}
                {activeTab === "voteOther" && <VoteOther/>}
                {activeTab === "description" && <Description content={challenge?.description}/>}
                {/* User Detail Popup */}
                {showPopup && (
                    <MemberListPopup
                        onClose={closeUserDetail}
                    />
                )}
            </div>

        </div>
    );
};

export default JoinedChallengeDetail;
