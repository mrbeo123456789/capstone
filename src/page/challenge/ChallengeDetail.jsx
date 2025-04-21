import { useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { HiUsers } from "react-icons/hi";
import { FaRunning } from "react-icons/fa";
import {
    useGetChallengeDetailQuery,
    useJoinChallengeMutation,
} from "../../service/challengeService";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ChallengeDetail = () => {
    const [activeTab, setActiveTab] = useState("info");
    const { id } = useParams();
    const { t } = useTranslation();
    const [joinChallenge, { isLoading }] = useJoinChallengeMutation();

    const {
        data: challenge,
        isLoading: isLoadingDetail,
        error,
    } = useGetChallengeDetailQuery(id);

    if (isLoadingDetail) return <p>{t("loading")}</p>;
    if (error) return <p>{t("error")}</p>;

    const handleJoin = async () => {
        try {
            await joinChallenge(parseInt(id));
            toast.success(t("ChallengeDetail.joinSuccess"));
        } catch (err) {
            console.error(err);
            toast.error(t("ChallengeDetail.joinFail"));
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString("en-GB"); // format: dd/mm/yyyy
    };

    // Translate participation & verification type
    const translateParticipation = (type) =>
        type === "INDIVIDUAL" ? "Cá nhân" : "Theo nhóm";
    const translateVerification = (type) =>
        type === "HOST_REVIEW" ? "Host duyệt" : "Thành viên duyệt";

    return (
        <div className="p-6 flex flex-col items-center w-full">
            {/* Banner Section */}
            <div className="w-full flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                    src={challenge.picture}
                    alt={challenge.name}
                    className="object-cover w-full md:w-1/2 max-h-[490px]"
                />
                <div className="bg-gray-100 p-6 w-full flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">{challenge.name}</h2>

                        {challenge.joined ? (
                            <span className="text-sm font-medium text-green-600">
                                {t("ChallengeDetail.joinedStatus")}
                            </span>
                        ) : (() => {
                            const now = new Date();
                            const start = new Date(challenge.startDate);
                            const end = new Date(challenge.endDate);

                            if (now > end) {
                                return <span
                                    className="text-sm font-medium text-gray-500">{t("ChallengeDetail.ended")}</span>;
                            }
                            if (now >= start) {
                                return <span
                                    className="text-sm font-medium text-gray-500">{t("ChallengeDetail.alreadyStarted")}</span>;
                            }
                            return (
                                <button
                                    onClick={handleJoin}
                                    className="bg-orange-500 text-white rounded hover:bg-orange-600 px-4 py-2 text-sm font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? t("ChallengeDetail.joining")
                                        : t("ChallengeDetail.joinButton")}
                                </button>
                            );
                        })()}
                    </div>

                    <div className="mt-4 flex items-center">
                        <FaRegClock className="text-gray-500 mr-2"/>
                        <p className="text-gray-700 text-sm">
                            {formatDate(challenge.startDate)} → {formatDate(challenge.endDate)}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center">
                        <MdOutlineCategory className="text-gray-500 mr-2"/>
                        <p className="text-gray-700 text-sm">
                            {t("ChallengeDetail.category")}: {challenge.challengeType}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center">
                        <FaRunning className="text-gray-500 mr-2"/>
                        <p className="text-gray-700 text-sm">
                            {t("ChallengeDetail.participation")}: {translateParticipation(challenge.participationType)}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center">
                        <IoIosPeople className="text-gray-500 mr-2"/>
                        <p className="text-gray-700 text-sm">
                            {t("ChallengeDetail.verification")}: {translateVerification(challenge.verificationType)}
                        </p>
                    </div>

                    <h3 className="text-gray-800 font-semibold mt-6">
                        {t("ChallengeDetail.totalParticipants")}
                    </h3>
                    <div className="mt-2 flex items-center text-lg font-semibold text-orange-500">
                        <HiUsers className="mr-2"/>
                        <p>{challenge.participantCount} / {challenge.maxParticipants} {t("ChallengeDetail.peopleJoined")}</p>
                    </div>
                </div>
        </div>

    {/* Tabs Section */
    }
    <div className="mt-6 w-full">
        <div className="flex border-b">
            {["info", "rules", "team", "individual"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-center py-3 font-semibold ${
                        activeTab === tab
                            ? "text-orange-500 border-b-4 border-orange-500"
                            : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                    {t(`ChallengeDetail.tab.${tab}`)}
                </button>
            ))}
        </div>

        <div className="p-6 bg-white shadow-md rounded-lg mt-4">
            {activeTab === "info" && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{challenge.name}</h2>
                    <p className="text-gray-500 mt-2">
                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                        {t("ChallengeDetail.category")}:{" "}
                        <span className="text-orange-500 font-semibold">
                                    {challenge.challengeType}
                                </span>
                    </p>
                    <div
                        className="mt-6 border-t pt-4 text-gray-700"
                        dangerouslySetInnerHTML={{__html: challenge.description}}
                    />
                </div>
            )}

            {activeTab === "rules" && (
                <p className="text-gray-700">{t("ChallengeDetail.rulesText")}</p>
            )}
            {activeTab === "team" && (
                <p className="text-gray-700">{t("ChallengeDetail.teamRanking")}</p>
            )}
            {activeTab === "individual" && (
                <p className="text-gray-700">{t("ChallengeDetail.individualRanking")}</p>
            )}
        </div>
    </div>
</div>
)
    ;
};

export default ChallengeDetail;
