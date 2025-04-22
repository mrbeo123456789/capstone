import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetMyChallengesMutation } from "../../service/challengeService.js";
import { useGetMyInvitationsQuery, useRespondInvitationMutation } from "../../service/invitationService.js";
import NoInvitationsIllustration from "../../component/NoInvitationsIllustration.jsx";
import { toast } from "react-toastify";

const YourChallenge = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("All");

    const [getMyChallenges, { data: joinedChallenges = [], isLoading }] = useGetMyChallengesMutation();
    const {
        data: invitations = [],
        isLoading: isInvitationsLoading,
        refetch: refetchInvitations,
    } = useGetMyInvitationsQuery();
    const [respondInvitation] = useRespondInvitationMutation();

    const themeColor = "#FF5733";

    useEffect(() => {
        getMyChallenges(activeTab.toUpperCase());
    }, [activeTab]);

    const handleRespond = async (invitationId, invitationType, accept) => {
        try {
            await respondInvitation({
                invitationId,
                invitationType,
                accept,
            });

            toast.success(
                accept
                    ? t("yourChallenge.accepted")
                    : t("yourChallenge.declined")
            );

            // ✅ Reload lại cả lời mời và danh sách thử thách
            if (typeof refetchInvitations === "function") {
                refetchInvitations();
            }
            getMyChallenges(activeTab.toUpperCase());
        } catch (error) {
            console.error("Failed to respond to invitation:", error);
            toast.error(t("yourChallenge.failedResponse"));
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return { text: t("yourChallenge.status.pending"), bg: "bg-gray-100", textColor: "text-gray-600" };
            case "ACCEPTED":
                return { text: t("yourChallenge.status.approved"), bg: "bg-green-100", textColor: "text-green-700" };
            case "DECLINED":
            case "REJECTED":
                return { text: t("yourChallenge.status.rejected"), bg: "bg-red-100", textColor: "text-red-700" };
            case "CANCELED":
                return { text: t("yourChallenge.status.canceled"), bg: "bg-yellow-100", textColor: "text-yellow-800" };
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
                    {t("yourChallenge.create")}
                </button>

                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder={t("yourChallenge.search")}
                        className="border rounded-lg px-3 py-2 w-48"
                    />
                    <button className="border px-3 py-2 rounded-lg">{t("yourChallenge.filter")} ▼</button>
                </div>
            </div>

            {/* Invitations */}
            <div className="border rounded-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold">{t("yourChallenge.invitations")} ({invitations.length})</h2>
                {isInvitationsLoading ? (
                    <p>{t("yourChallenge.loadingInvitations")}</p>
                ) : invitations.length === 0 ? (
                    <div
                        className="h-52 w-full flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                        <NoInvitationsIllustration themeColor={themeColor}/>
                        <p className="font-semibold text-sm mt-2">{t("yourChallenge.noInvitations")}</p>
                    </div>
                ) : (
                    <div className="flex gap-6 overflow-x-auto pb-2">
                        {invitations.map((invite) => (
                            <div
                                key={invite.id}
                                className="cursor-pointer min-w-[200px] p-4 border rounded-lg space-y-2 flex-shrink-0 hover:shadow-lg transition"
                                onClick={() => navigate(`/challenges/detail/${invite.challengeId}`)}
                            >
                                <p className="text-sm">{invite.inviterInfo} {t("yourChallenge.inviteText")}</p>
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
                                            e.stopPropagation(); // ✅ ngăn redirect
                                            handleRespond(invite.invitationId, invite.invitationType, true);
                                        }}
                                    >
                                        {t("yourChallenge.accept")}
                                    </button>
                                    <button
                                        className="border px-3 py-1 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation(); // ✅ ngăn redirect
                                            handleRespond(invite.invitationId, invite.invitationType, false);
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

            {/* Filter Tabs */}
            <div className="flex gap-4">
                {["All", "host", "cohost", "member"].map((tab) => (
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
                <h2 className="text-lg font-semibold mb-4">{t("yourChallenge.joinedChallenges")}</h2>
                {isLoading ? (
                    <p>{t("yourChallenge.loadingChallenges")}</p>
                ) : joinedChallenges.length === 0 ? (
                    <div className="h-52 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                        <div>
                            <p className="font-semibold">{t("yourChallenge.noJoined")}</p>
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

                                    {/* 👑 Host icon on the top-left */}
                                    {challenge.role === "HOST" && (
                                        <span
                                            className="absolute top-2 left-2 text-yellow-400 text-xl drop-shadow-md">👑</span>
                                    )}

                                    {/* 🧍/👥 Participation icon on the top-right */}
                                    <span
                                        className="absolute top-2 right-2 text-white text-xl px-1.5 py-0.5"
                                        title={challenge.participationType === "INDIVIDUAL" ? "Individual" : "Group"}
                                    >
                                        {challenge.participationType === "INDIVIDUAL" ? "🧍" : "👥"}
                                    </span>
                                    {/* 🕓 Remaining days at bottom-right */}
                                    {challenge.remainingDays > 0 && challenge.remainingDays < 7 && (
                                        <div className="absolute bottom-1 right-2 text-xs text-orange-500 bg-white/80 px-2 py-0.5 rounded shadow">
                                            🕓 {challenge.remainingDays} day{challenge.remainingDays > 1 ? "s" : ""} left
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-center gap-1 mb-2 w-full px-2">
                                    {challenge.role === "HOST" && (
                                        <span className="text-gray-600 hover:text-blue-600 text-sm cursor-pointer"
                                              title="Edit challenge" onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/challenges/edit/${challenge.id}`);
                                        }}>
      ✏️
    </span>
                                    )}
                                    <p className="font-medium text-center truncate">{challenge.name}</p>
                                </div>

                                {(() => {
                                    const {text, bg, textColor} = getStatusStyle(challenge.status);
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
