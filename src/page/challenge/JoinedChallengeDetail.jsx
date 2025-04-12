import React, { useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import ProofUploads from "./ProofUploads";
import RankingList from "./RankingList";
import VoteOther from "./VoteOther";
import MemberListPopup from "../ui/MemberListPopup.jsx";
import {useParams} from "react-router-dom";
import {useGetChallengeDetailQuery} from "../../service/challengeService.js";
import Description from "./Description.jsx";
import ProgressTracking from "./ProgressTracking.jsx";
import {useGetMyEvidencesByChallengeQuery} from "../../service/evidenceService.js";
import {FaCheckCircle, FaClipboardCheck, FaInfoCircle, FaStar, FaTrophy} from "react-icons/fa";
import ChallengeInvitePopup from "./ChallengeInvitePopup.jsx";

const JoinedChallengeDetail = () => {
    const [activeTab, setActiveTab] = useState("proof");
    const [showPopup, setShowPopup] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const tabItems = [
        { key: "proof", label: "Proof", icon: <FaCheckCircle /> },
        { key: "ranking", label: "Ranking", icon: <FaTrophy /> },
        { key: "review", label: "Review", icon: <FaClipboardCheck /> },
        { key: "vote", label: "Vote Other", icon: <FaStar /> },
        { key: "description", label: "Description", icon: <FaInfoCircle /> },
    ];

    const { id } = useParams(); // Lấy challenge ID từ URL
    const { data, isLoading, error } = useGetChallengeDetailQuery(id);
    const {data: evidenceData, isEvidenceLoading, errorEvidence } = useGetMyEvidencesByChallengeQuery(id);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading challenge detail</p>;

    const challenge = data;

    // Invite Section
    const openInviteMember = () => {
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
                    <div className="w-full md:w-3/5 md:pr-6 pb-6 md:pb-0">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">{challenge?.name}</h2>
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
                                    <div
                                        className="absolute z-10 mt-2 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="py-1">
                                            <button onClick={() => openInviteMember()}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Invite
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Leave
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Edit
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Share
                                            </button>
                                            <button
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Report
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
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
                            className="w-full h-[450px] object-cover rounded"
                        />
                    </div>
                </div>
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
                {activeTab === "review" && <VoteOther />} {/* ← This is now Review tab */}
                {activeTab === "vote" && <VoteOther/>}
                {activeTab === "description" && <Description content={challenge?.description}/>}
                {/* User Detail Popup */}
                {showPopup && (
                    <ChallengeInvitePopup
                        onClose={closeUserDetail}
                    />
                )}
            </div>

        </div>
    );
};

export default JoinedChallengeDetail;