import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetMyChallengesMutation } from "../../service/challengeService.js";
import { useGetMyInvitationsQuery, useRespondInvitationMutation } from "../../service/invitationService.js";
import NoInvitationsIllustration from "../../component/NoInvitationsIllustration.jsx";
import { toast } from "react-toastify";
import JoinedGroup from "./modal/JoinedChallengeGroup.jsx";

const YourChallenge = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("All");
    const [filterType, setFilterType] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [isJoinedGroupOpen, setIsJoinedGroupOpen] = useState(false); // ✅ popup chọn nhóm
    const [selectedInvitation, setSelectedInvitation] = useState(null); // ✅ lời mời đang chọn

        const [getMyChallenges, { data: joinedChallenges = [], isLoading }] = useGetMyChallengesMutation();
    const { data: invitations = [], isLoading: isInvitationsLoading, refetch: refetchInvitations } = useGetMyInvitationsQuery();
    const [respondInvitation] = useRespondInvitationMutation();

    const themeColor = "#FF5733";

    useEffect(() => {
        getMyChallenges(activeTab.toUpperCase());
    }, [activeTab]);

    const handleRespond = async (invitationId, invitationType, accept, challengeId) => {
        if (invitationType === "GROUP" && accept) {
            // ✅ Nếu Accept nhóm → mở popup chọn nhóm
            setSelectedInvitation({ invitationId, invitationType, challengeId });
            setIsJoinedGroupOpen(true);
        } else {
            // ✅ Nếu cá nhân hoặc decline → gửi API luôn
            try {
                await respondInvitation({ invitationId, invitationType, accept });
                toast.success(accept ? t("yourChallenge.accepted") : t("yourChallenge.declined"));
                refetchInvitations();
                getMyChallenges(activeTab.toUpperCase());
            } catch (error) {
                console.error("Failed to respond to invitation:", error);
                toast.error(t("yourChallenge.failedResponse"));
            }
        }
    };

    const filteredChallenges = joinedChallenges.filter((challenge) =>
        challenge.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInvitations = invitations.filter((invite) => {
        if (filterType === "PERSONAL") return invite.invitationType === "PERSONAL";
        if (filterType === "GROUP") return invite.invitationType === "GROUP";
        return true;
    });
    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return { text: t("yourChallenge.status.pending"), bg: "bg-yellow-100", textColor: "text-yellow-800" };
            case "ACCEPTED":
                return { text: t("yourChallenge.status.accepted"), bg: "bg-green-100", textColor: "text-green-700" };
            case "REJECTED":
                return { text: t("yourChallenge.status.rejected"), bg: "bg-red-100", textColor: "text-red-700" };
            case "ONGOING":
                return { text: t("yourChallenge.status.ongoing"), bg: "bg-blue-100", textColor: "text-blue-700" };
            case "COMPLETED":
                return { text: t("yourChallenge.status.completed"), bg: "bg-gray-100", textColor: "text-gray-800" };
            default:
                return { text: status, bg: "bg-gray-100", textColor: "text-gray-600" };
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
                    {t("yourChallenge.create")}
                </button>
            </div>

            {/* Invitations */}
            <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t("yourChallenge.invitations")} ({filteredInvitations.length})</h2>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border px-3 py-2 rounded-lg text-sm"
                    >
                        <option value="ALL">{t("yourChallenge.filterAll")}</option>
                        <option value="PERSONAL">{t("yourChallenge.filterPersonal")}</option>
                        <option value="GROUP">{t("yourChallenge.filterGroup")}</option>
                    </select>
                </div>

                {isInvitationsLoading ? (
                    <p>{t("yourChallenge.loadingInvitations")}</p>
                ) : filteredInvitations.length === 0 ? (
                    <div className="h-52 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        <NoInvitationsIllustration themeColor={themeColor} />
                        <p className="font-semibold text-sm mt-2">{t("yourChallenge.noInvitations")}</p>
                    </div>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-2">
                        {filteredInvitations.map((invite) => (
                            <div
                                key={invite.id}
                                className="cursor-pointer w-[210px] p-4 border rounded-lg space-y-2 flex-shrink-0 hover:shadow-lg transition"
                                onClick={() => navigate(`/challenges/detail/${invite.challengeId}`)}
                            >
                                {/* Icon + Text */}
                                <div className="flex items-center gap-2">
                                    {invite.invitationType === "PERSONAL" ? (
                                        <span className="text-blue-500 text-lg">📩</span>
                                    ) : (
                                        <span className="text-green-500 text-lg">👥</span>
                                    )}
                                    <p className="text-sm">{t("yourChallenge.inviteGeneric")}</p>
                                </div>

                                <div className="h-24 bg-gray-200 rounded overflow-hidden">
                                    <img
                                        src={invite.challengeImage || "https://via.placeholder.com/300x200"}
                                        alt={invite.challengeName}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                <p className="font-medium text-center mb-2 line-clamp-1">{invite.challengeName}</p>

                                <div className="flex gap-2">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.invitationId, invite.invitationType, true, invite.challengeId);
                                        }}
                                    >
                                        {t("yourChallenge.accept")}
                                    </button>
                                    <button
                                        className="border px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRespond(invite.invitationId, invite.invitationType, false, invite.challengeId);
                                        }}
                                    >
                                        {t("yourChallenge.decline")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Popup chọn nhóm khi accept GROUP invitation */}
            {isJoinedGroupOpen && selectedInvitation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
                        <JoinedGroup
                            onClose={() => setIsJoinedGroupOpen(false)}
                            invitation={selectedInvitation}
                            onSuccessJoin={() => {
                                refetchInvitations();
                                getMyChallenges(activeTab.toUpperCase());
                                toast.success(t("challengeInvite.success"));
                                setTimeout(() => setIsJoinedGroupOpen(false), 300);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-4">
                {["All", "host", "co_host", "member"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg ${activeTab === tab ? "bg-blue-600 text-white" : "border"}`}
                    >
                        {t(`yourChallenge.tabs.${tab.toLowerCase()}`)}
                    </button>
                ))}
            </div>

            {/* Joined Challenges */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{t("yourChallenge.joinedChallenges")}</h2>
                    <input
                        type="text"
                        placeholder={t("yourChallenge.search")}
                        className="border rounded-lg px-3 py-2 w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <p>{t("yourChallenge.loadingChallenges")}</p>
                ) : filteredChallenges.length === 0 ? (
                    <div className="h-52 flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        <p className="font-semibold">{t("yourChallenge.noJoined")}</p>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {filteredChallenges.map((challenge) => (
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
                                        <span className="absolute top-2 left-2 text-yellow-400 text-xl">👑</span>
                                    )}
                                    <span
                                        className="absolute top-2 right-2 text-white text-xl"
                                        title={challenge.participationType === "INDIVIDUAL" ? "Individual" : "Group"}
                                    >
                                        {challenge.participationType === "INDIVIDUAL" ? "🧍" : "👥"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-center gap-1 mb-2 w-full px-2">
                                    {challenge.role === "HOST" && (
                                        <span className="text-gray-600 hover:text-blue-600 text-sm cursor-pointer"
                                              title="Edit challenge"
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  navigate(`/challenges/edit/${challenge.id}`);
                                              }}>
                                            ✏️
                                        </span>
                                    )}
                                    <p className="font-medium text-center truncate">{challenge.name}</p>
                                </div>

                                {(() => {
                                    const { text, bg, textColor } = getStatusStyle(challenge.status);
                                    return (
                                        <div className={`${bg} ${textColor} text-xs px-2 py-1 rounded mb-1 flex items-end`}>
                                            {text}
                                        </div>
                                    );
                                })()}

                                <div className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mt-auto mb-2">
                                    {t(`yourChallenge.tabs.${challenge.role.toLowerCase()}`)}
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
