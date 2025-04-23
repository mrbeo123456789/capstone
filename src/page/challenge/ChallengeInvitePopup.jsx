import { useState } from "react";
import { IoCloseCircle, IoPeople, IoAlbums, IoSparkles } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import InviteMembers from "./InviteMembers.jsx";
import InviteGroups from "./InviteGroups.jsx";
import InviteSuggestions from "./InviteSuggestions.jsx";

const ChallengeInvitePopup = ({ onClose, participationType }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("members");

    const isGroupParticipation = participationType === "GROUP";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('challengeInvite.title')}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <IoCloseCircle className="text-2xl" />
                    </button>
                </div>

                {/* Tabs */}
                {isGroupParticipation ? null : (
                    <div className="flex justify-around bg-gray-100 p-2">
                        <button
                            onClick={() => setActiveTab("suggested")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md ${activeTab === "suggested" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-100"}`}
                        >
                            <IoSparkles className="text-xl" />
                            {t("challengeInvite.suggestedTitle")}
                        </button>
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md ${activeTab === "members" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-100"}`}
                        >
                            <IoPeople className="text-xl" />
                            {t('challengeInvite.inviteMembers')}
                        </button>
                        <button
                            onClick={() => setActiveTab("groups")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md ${activeTab === "groups" ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-orange-100"}`}
                        >
                            <IoAlbums className="text-xl" />
                            {t('challengeInvite.inviteGroups')}
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {isGroupParticipation ? (
                        <InviteMembers onClose={onClose} participationType={participationType} />
                    ) : (
                        <>
                            {activeTab === "suggested" && <InviteSuggestions onClose={onClose} />}
                            {activeTab === "members" && <InviteMembers onClose={onClose} />}
                            {activeTab === "groups" && <InviteGroups onClose={onClose} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengeInvitePopup;
