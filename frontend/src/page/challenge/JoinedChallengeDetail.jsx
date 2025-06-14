import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
    FaCheckCircle, FaClipboardCheck, FaFlag, FaInfoCircle,
    FaShareAlt, FaSignOutAlt, FaUsers, FaUserPlus, FaWindowClose
} from "react-icons/fa";
import ProofUploads from "./ProofUploads";
import RankingList from "./RankingList";
import VoteOther from "./VoteOther";
import Description from "./Description.jsx";
import ProgressTracking from "./ProgressTracking.jsx";
import ChallengeInvitePopup from "./ChallengeInvitePopup.jsx";
import {
    useCancelChallengeMutation,
    useGetChallengeDetailQuery,
    useLeaveChallengeMutation
} from "../../service/challengeService.js";
import { useGetMyEvidencesByChallengeQuery } from "../../service/evidenceService.js";
import ReportChallengeModal from "./modal/ReportChallengeModal.jsx";
import MemberManagementModal from "./modal/MemberManagementModal.jsx";
import ChallengeGroupTab from "./ChallengeGroupTab.jsx";
import HostEvidenceManagement from "./HostEvidenceManagement.jsx";
import GroupChallengeInvite from "./GroupChallengeInvite.jsx";

const JoinedChallengeDetail = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("proof");
    const [showPopup, setShowPopup] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showMemberInvite, setShowMemberInvite] = useState(false);
    const [showGroupInvite, setShowGroupInvite] = useState(false);
    const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
    const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();

    const { data, isLoading, error } = useGetChallengeDetailQuery(id);
    const {
        data: evidenceData,
        isLoading: isEvidenceLoading,
        refetch: refetchEvidence // 👈 Destructure refetch
    } = useGetMyEvidencesByChallengeQuery(id);

    const [leaveChallenge] = useLeaveChallengeMutation();
    const [cancelChallenge] = useCancelChallengeMutation();

    useEffect(() => {
        if (data && data.joined === false) {
            toast.error(t("JoinsChallengeDetail.notJoined"));
            navigate(`/challenges/detail/${id}`, { replace: true });
        }
    }, [data, id, navigate, t]);

    if (isLoading) return <p>{t("JoinsChallengeDetail.loading")}</p>;
    if (error) return <p>{t("JoinsChallengeDetail.error")}</p>;

    const challenge = data;

    const openInviteMember = () => {
        if (challenge.participationType === "GROUP") {
            setShowGroupInvite(true);
        } else {
            setShowMemberInvite(true);
        }
    };
    const closeInvite = () => {
        setShowGroupInvite(false);
        setShowMemberInvite(false);
    };

    const closeUserDetail = () => setShowPopup(false);
    const openReportModal = () => setShowReportModal(true);
    const closeReportModal = () => setShowReportModal(false);
    const openMemberModal = () => setShowMemberModal(true);
    const closeMemberModal = () => setShowMemberModal(false);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => toast.success(t("JoinsChallengeDetail.shareSuccess")))
            .catch(() => toast.error(t("JoinsChallengeDetail.shareFailed")));
    };

    const handleLeave = async () => {
        try {
            await leaveChallenge(challenge.id);
            toast.success(t("JoinsChallengeDetail.leaveSuccess"));
            navigate("/challenges/joins");
        } catch (e) {
            const message = e?.data?.message || t("JoinsChallengeDetail.leaveFail");
            toast.error(message);
        }
    };

    const ConfirmCancelModal = ({ onConfirm, onCancel, title, message }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 animate-scaleIn">
                <h2 className="text-xl font-bold text-center mb-4">{title}</h2>
                <p className="text-gray-700 text-center mb-6">{message}</p>
                <div className="flex justify-center gap-6">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
                        {t("JoinsChallengeDetail.confirmCancelNo")}
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        {t("JoinsChallengeDetail.confirmCancelYes")}
                    </button>
                </div>
            </div>
        </div>
    );


    const handleCancelChallenge = async () => {
        setShowConfirmCancelModal(true); // 🆕 mở modal trước
    };

    const confirmCancelChallenge = async () => {
        try {
            await cancelChallenge(challenge.id).unwrap();
            toast.success(t("JoinsChallengeDetail.cancelSuccess"));
            navigate("/challenges/joins");
        } catch (e) {
            const message = e?.data?.message || t("JoinsChallengeDetail.cancelFail");
            toast.error(message);
        } finally {
            setShowConfirmCancelModal(false); // đóng modal
        }
    };

    const cancelModal = () => {
        setShowConfirmCancelModal(false); // chỉ đóng modal
    };

    const tabItems = [
        { key: "proof", label: t("JoinsChallengeDetail.proof"), icon: <FaCheckCircle /> },
        {
            key: "ranking",
            label:
                challenge.participationType === "GROUP"
                    ? t("JoinsChallengeDetail.groups")
                    : t("JoinsChallengeDetail.member"),
            icon: <FaUsers />
        },
        { key: "review", label: t("JoinsChallengeDetail.review"), icon: <FaClipboardCheck /> },
        { key: "description", label: t("JoinsChallengeDetail.description"), icon: <FaInfoCircle /> },
    ];

    // 👉 Thêm tab Report nếu là HOST
    if (["HOST", "CO_HOST"].includes(challenge?.role)) {
        tabItems.push({
            key: "report",
            label: t("JoinsChallengeDetail.reportTab"),
            icon: <FaFlag />
        });
    }

    return (
        <div className="w-full">
            <div className="mx-auto bg-white rounded-lg shadow-lg p-6 m-2">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="w-full md:w-3/5 md:pr-6 pb-6 md:pb-0">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">{challenge?.name}</h2>
                            <div className="flex gap-3 items-center mb-4">
                                {/* Determine date status */}
                                {(() => {
                                    const now = new Date();
                                    const start = new Date(challenge.startDate);
                                    const end = new Date(challenge.endDate);
                                    const isBeforeStart = now < start;
                                    const isAfterEnd = now > end;
                                    const isOngoing = now >= start && now <= end;
                                    return (
                                        <>
                                            {["HOST", "CO_HOST"].includes(challenge?.role) && (
                                                <button
                                                    title={t("JoinsChallengeDetail.memberManagement")}
                                                    onClick={openMemberModal}
                                                    className="text-green-500 hover:text-green-700 text-xl"
                                                >
                                                    <FaUsers />
                                                </button>
                                            )}
                                            {/* Invite Button */}
                                            <button
                                                title={
                                                    isOngoing
                                                        ? t("JoinsChallengeDetail.disabledDuringChallenge")
                                                        : t("JoinsChallengeDetail.invite")
                                                }
                                                onClick={isOngoing ? undefined  : openInviteMember}
                                                disabled={isOngoing}
                                                className={`text-xl transition ${
                                                    isOngoing
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-orange-500 hover:text-orange-700"
                                                }`}
                                            >
                                                <FaUserPlus />
                                            </button>

                                            {/* Leave Button */}
                                            <button
                                                title={
                                                    challenge.role === "HOST"
                                                        ? t("JoinsChallengeDetail.hostCannotLeave")
                                                        : isOngoing
                                                            ? t("JoinsChallengeDetail.disabledDuringChallenge")
                                                            : t("JoinsChallengeDetail.leave")
                                                }
                                                onClick={
                                                    challenge.role === "HOST" || isOngoing
                                                        ? undefined
                                                        : () => setShowConfirmLeaveModal(true)
                                                }
                                                disabled={challenge.role === "HOST" || isOngoing}
                                                className={`text-xl transition ${
                                                    challenge.role === "HOST" || isOngoing
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-red-500 hover:text-red-700"
                                                }`}
                                            >
                                                <FaSignOutAlt/>
                                            </button>


                                            {/* Share Button */}
                                            <button
                                                title={t("JoinsChallengeDetail.share")}
                                                onClick={handleShare}
                                                className="text-blue-500 hover:text-blue-700 text-xl"
                                            >
                                                <FaShareAlt/>
                                            </button>

                                            {/* Report Button */}
                                            <button
                                                title={
                                                    challenge?.role === "HOST"
                                                        ? t("JoinsChallengeDetail.hostCannotReport")
                                                        : t("JoinsChallengeDetail.report")
                                                }
                                                onClick={challenge?.role === "HOST" ? undefined : openReportModal}
                                                disabled={challenge?.role === "HOST"}
                                                className={`text-xl transition ${
                                                    challenge?.role === "HOST"
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-red-500 hover:text-red-700"
                                                }`}
                                            >
                                                <FaFlag/>
                                            </button>

                                            {challenge?.role === "HOST" && (
                                                <button
                                                    title={t("JoinsChallengeDetail.cancelChallenge")}
                                                    onClick={handleCancelChallenge}
                                                    className="text-red-600 hover:text-red-800 text-xl"
                                                >
                                                    <FaWindowClose />
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <p className="text-gray-500 mt-2">{challenge?.startDate} - {challenge?.endDate}</p>
                        <p className="text-sm text-gray-700 mt-2">
                            {t("JoinsChallengeDetail.title")}: <span
                            className="text-orange-500 font-semibold">{challenge?.challengeType}</span>
                        </p>
                        <div>
                            <ProgressTracking
                                challenge={challenge}
                                evidence={evidenceData}
                                onUploadSuccess={() => {
                                    setActiveTab("review");     // ✅ Switch to "review" tab
                                    refetchEvidence();                  // ✅ Refetch the evidence data
                                }}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-200 flex items-center justify-center rounded-lg md:w-2/5">
                        <img src={challenge?.picture} alt={challenge?.name}
                             className="w-full h-[450px] object-cover rounded"/>
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

                {activeTab === "ranking" && (
                    challenge.participationType === "GROUP" ? (
                        <ChallengeGroupTab />
                    ) : (
                        <RankingList />
                    )
                )}

                {activeTab === "review" && <VoteOther />}
                {activeTab === "description" && <Description content={challenge} />}
                {activeTab === "report" && (
                    <div className="text-center text-gray-600">
                        {/* Bạn có thể thay bằng component thực sự nếu có */}
                        <HostEvidenceManagement challengeId={challenge.id}/>
                    </div>
                )}


                {showMemberInvite && <ChallengeInvitePopup onClose={closeInvite} />}
                {showGroupInvite && <GroupChallengeInvite onClose={closeInvite} />}
                {showPopup && (
                    <ChallengeInvitePopup
                        onClose={closeUserDetail}
                        challengeId={challenge.id}
                        participationType={challenge.participationType} // ✅ truyền vào đây
                    />
                )}
                {showReportModal && <ReportChallengeModal challengeId={challenge.id} onClose={closeReportModal} />}
                {showMemberModal && (
                    <MemberManagementModal
                        show={showMemberModal}
                        onClose={closeMemberModal}
                        challengeId={challenge.id}
                        currentUserRole={challenge?.role}
                    />
                )}
                {showConfirmCancelModal && (
                    <ConfirmCancelModal
                        onConfirm={confirmCancelChallenge}
                        onCancel={cancelModal}
                        title={t("JoinsChallengeDetail.confirmCancelTitle")}
                        message={t("JoinsChallengeDetail.confirmCancelMessage")}
                    />
                )}
                {showConfirmLeaveModal && (
                    <ConfirmCancelModal
                        onConfirm={async () => {
                            await handleLeave();
                            setShowConfirmLeaveModal(false);
                        }}
                        onCancel={() => setShowConfirmLeaveModal(false)}
                        title={t("JoinsChallengeDetail.confirmLeaveTitle")}
                        message={t("JoinsChallengeDetail.confirmLeaveMessage")}
                    />
                )}

            </div>
        </div>
    );
};

export default JoinedChallengeDetail;