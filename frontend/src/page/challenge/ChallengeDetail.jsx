import { useState, useEffect } from "react"; // 🆙 nhớ thêm useEffect
import { useNavigate, useParams } from "react-router-dom"; // 🆙 nhớ import navigate
import { FaRegClock, FaRunning } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import { HiUsers } from "react-icons/hi";
import { useGetChallengeDetailQuery, useJoinChallengeMutation } from "../../service/challengeService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import JoinedGroup from "./modal/JoinedChallengeGroup.jsx";
import SelectGroupModal from "./modal/SelectGroupModal.jsx";

const ChallengeDetail = () => {
    const [activeTab, setActiveTab] = useState("description");
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate(); // 🆙 cần navigate
    const [joinChallenge, { isLoading }] = useJoinChallengeMutation();
    const [selectedInvitation, setSelectedInvitation] = useState(null);

    const {
        data: challenge,
        isLoading: isLoadingDetail,
        error,
    } = useGetChallengeDetailQuery(id);

    useEffect(() => {
        if (challenge) {
            const { challengeStatus, role } = challenge;
            if (challengeStatus === "PENDING" && role !== "HOST") {
                toast.warning(t("ChallengeDetail.challengePending"));
                setTimeout(() => {
                    navigate("/homepage");
                }, 1000);
            }
        }
    }, [challenge, navigate, t]);

    if (isLoadingDetail) return <p>{t("loading")}</p>;
    if (error) return <p>{t("error")}</p>;


    const handleJoin = async () => {
        if (!challenge.memberId) {
            toast.warn(t("ChallengeDetail.loginRequired"));
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
            return;
        }

        if (challenge.participationType === "GROUP") {
            setSelectedInvitation({
                challengeId: challenge.id,
                invitationId: -1, // dùng -1 để phân biệt là không phải lời mời thật
                invitationType: "GROUP",
            });


        } else {
            try {
                await joinChallenge(parseInt(id));
                toast.success(t("ChallengeDetail.joinSuccess"));
                // window.location.reload();
            } catch (err) {
                console.error(err);
                toast.error(t("ChallengeDetail.joinFail"));
            }
        }

    };

    const formatDate = (isoString) => {
        if (!isoString) return t("ChallengeDetail.notAvailable");
        const date = new Date(isoString);
        return date.toLocaleDateString("en-GB");
    };

    const translateParticipation = (type) =>
        type === "INDIVIDUAL" ? t("ChallengeDetail.participationType.individual") : t("ChallengeDetail.participationType.group");

    const translateVerification = (type) =>
        type === "HOST_REVIEW" ? t("ChallengeDetail.verificationType.hostReview") : t("ChallengeDetail.verificationType.memberReview");

    return (
        <div className="p-6 flex flex-col items-center w-full">
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
                            const normalizeDate = (date) => {
                                const d = new Date(date);
                                d.setHours(0, 0, 0, 0);
                                return d;
                            };
                            const now = normalizeDate(new Date());
                            const start = normalizeDate(new Date(challenge.startDate));
                            const end = normalizeDate(new Date(challenge.endDate));

                            console.log("now:", now);
                            console.log("start:", start);
                            console.log("end:", end);
                            console.log(now >= start);
                            if (now > end) {
                                return <span className="text-sm font-medium text-gray-500">{t("ChallengeDetail.ended")}</span>;
                            }
                            if (now >= start) {
                                return <span className="text-sm font-medium text-gray-500">{t("ChallengeDetail.alreadyStarted")}</span>;
                            }
                            return (
                                <button
                                    onClick={handleJoin}
                                    className="bg-orange-500 text-white rounded hover:bg-orange-600 px-4 py-2 text-sm font-medium"
                                    disabled={isLoading}
                                >
                                    {isLoading ? t("ChallengeDetail.joining") : t("ChallengeDetail.joinButton")}
                                </button>
                            );
                        })()}
                    </div>

                    <div className="mt-4 flex items-center">
                        <FaRegClock className="text-gray-500 mr-2" />
                        <p className="text-gray-700 text-sm">
                            {formatDate(challenge.startDate)} → {formatDate(challenge.endDate)}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center">
                        <MdOutlineCategory className="text-gray-500 mr-2" />
                        <p className="text-gray-700 text-sm">
                            {t("ChallengeDetail.category")}: {challenge.challengeType}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center">
                        <FaRunning className="text-gray-500 mr-2" />
                        <p className="text-gray-700 text-sm">
                            {t("ChallengeDetail.participation")}: {translateParticipation(challenge.participationType)}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center">
                        <IoIosPeople className="text-gray-500 mr-2" />
                        <p className="text-gray-700 text-sm">
                            {t("ChallengeDetail.verification")}: {translateVerification(challenge.verificationType)}
                        </p>
                    </div>

                    {/* Group Challenge Specific */}
                    {challenge.participationType === "GROUP" && (
                        <div className="mt-4 space-y-2">
                            <p className="text-gray-700 text-sm">
                                {t("ChallengeDetail.maxGroups")}: {challenge.maxGroups}
                            </p>
                            <p className="text-gray-700 text-sm">
                                {t("ChallengeDetail.maxMembersPerGroup")}: {challenge.maxMembersPerGroup}
                            </p>
                        </div>
                    )}

                    {/* Individual Challenge Specific */}
                    {challenge.participationType === "INDIVIDUAL" && (
                        <div className="mt-2 flex items-center text-lg font-semibold text-orange-500">
                            <HiUsers className="mr-2" />
                            <p>{challenge.participantCount} / {challenge.maxParticipants} {t("ChallengeDetail.peopleJoined")}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 w-full">
                <div className="p-6 bg-white shadow-md rounded-lg mt-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{challenge.name}</h2>
                        <p className="text-gray-500 mt-2">
                            {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                            {t("ChallengeDetail.category")}:{" "}
                            <span className="text-orange-500 font-semibold">{challenge.challengeType}</span>
                        </p>
                        <div
                            className="mt-6 border-t pt-4 text-gray-700"
                            dangerouslySetInnerHTML={{ __html: challenge.description }}
                        />
                    </div>
                </div>
            </div>
            {selectedInvitation && (
                <SelectGroupModal
                    challengeId={selectedInvitation.challengeId}
                    requiredMembers={challenge.maxMembersPerGroup}
                    onClose={() => setSelectedInvitation(null)}
                />
            )}



        </div>
    );
};

export default ChallengeDetail;
