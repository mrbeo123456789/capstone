import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
    FaCheckCircle, FaClipboardCheck, FaFlag, FaInfoCircle,
    FaShareAlt, FaSignOutAlt, FaUsers, FaUserPlus
} from "react-icons/fa";
import ProofUploads from "./ProofUploads";
import RankingList from "./RankingList";
import VoteOther from "./VoteOther";
import Description from "./Description.jsx";
import ProgressTracking from "./ProgressTracking.jsx";
import ChallengeInvitePopup from "./ChallengeInvitePopup.jsx";
import { useGetChallengeDetailQuery } from "../../service/challengeService.js";
import { useGetMyEvidencesByChallengeQuery } from "../../service/evidenceService.js";

const JoinedChallengeDetail = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("proof");
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, isLoading, error } = useGetChallengeDetailQuery(id);
    const { data: evidenceData, isEvidenceLoading } = useGetMyEvidencesByChallengeQuery(id);

    useEffect(() => {
        if (data && data.joined === false) {
            toast.error(t("JoinsChallengeDetail.notJoined"));
            navigate(`/challenges/detail/${id}`, { replace: true });
        }
    }, [data, id, navigate, t]);

    if (isLoading) return <p>{t("JoinsChallengeDetail.loading")}</p>;
    if (error) return <p>{t("JoinsChallengeDetail.error")}</p>;

    const challenge = data;

    const openInviteMember = () => setShowPopup(true);
    const closeUserDetail = () => setShowPopup(false);

    const tabItems = [
        { key: "proof", label: t("JoinsChallengeDetail.proof"), icon: <FaCheckCircle /> },
        { key: "ranking", label: t("JoinsChallengeDetail.member"), icon: <FaUsers /> },
        { key: "review", label: t("JoinsChallengeDetail.review"), icon: <FaClipboardCheck /> },
        { key: "description", label: t("JoinsChallengeDetail.description"), icon: <FaInfoCircle /> },
    ];

    return (
        <div className="w-full">
            <div className="mx-auto bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="w-full md:w-3/5 md:pr-6 pb-6 md:pb-0">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">{challenge?.name}</h2>
                            <div className="flex gap-3 items-center mb-4">
                                <button title={t("JoinsChallengeDetail.invite")} onClick={openInviteMember} className="text-orange-500 hover:text-orange-700 text-xl"><FaUserPlus /></button>
                                <button title={t("JoinsChallengeDetail.leave")} onClick={() => console.log("Leave")} className="text-red-500 hover:text-red-700 text-xl"><FaSignOutAlt /></button>
                                <button title={t("JoinsChallengeDetail.share")} onClick={() => console.log("Share")} className="text-blue-500 hover:text-blue-700 text-xl"><FaShareAlt /></button>
                                <button title={t("JoinsChallengeDetail.report")} onClick={() => console.log("Report")} className="text-red-500 hover:text-red-700 text-xl"><FaFlag /></button>
                            </div>
                        </div>
                        <p className="text-gray-500 mt-2">{challenge?.startDate} - {challenge?.endDate}</p>
                        <p className="text-sm text-gray-700 mt-2">
                            {t("JoinsChallengeDetail.title")}: <span className="text-orange-500 font-semibold">{challenge?.challengeType}</span>
                        </p>
                        <div>
                            <ProgressTracking challenge={challenge} evidence={evidenceData} />
                        </div>
                    </div>
                    <div className="bg-gray-200 flex items-center justify-center rounded-lg md:w-2/5">
                        <img src={challenge?.picture} alt={challenge?.name} className="w-full h-[450px] object-cover rounded" />
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
                        <p className="text-center py-4">{t("JoinsChallengeDetail.loadingProof")}</p>
                    ) : (
                        <ProofUploads challenge={challenge} evidence={evidenceData} />
                    )
                )}

                {activeTab === "ranking" && <RankingList />}
                {activeTab === "review" && <VoteOther />}
                {activeTab === "description" && <Description content={challenge?.description} />}
                {showPopup && <ChallengeInvitePopup onClose={closeUserDetail} />}
            </div>
        </div>
    );
};

export default JoinedChallengeDetail;