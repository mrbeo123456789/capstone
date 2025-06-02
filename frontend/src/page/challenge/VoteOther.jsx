import { useState, useEffect } from "react";
import { FaPlayCircle } from "react-icons/fa";
import VideoModal from "../ui/VideoModal.jsx";
import {
    useGetEvidencesToReviewQuery,
} from "../../service/evidenceService.js";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {useGetMyVotedEvidenceQuery} from "../../service/evidenceVoteService.js";

const VoteOther = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reviewedEvidences, setReviewedEvidences] = useState([]);
    const [modalData, setModalData] = useState(null);

    const { id } = useParams(); // Get challenge ID from URL
    const { data = [], isLoading, refetch } = useGetEvidencesToReviewQuery(id);
    const { data: votedHistory = [], isLoading: isVotedLoading, isError: isVotedError } = useGetMyVotedEvidenceQuery(id);


    // Filter out evidences that have already been reviewed
    const evidencesToReview = data.filter(
        (evidence) => !reviewedEvidences.includes(evidence.evidenceId)
    );

    const handleOpenVideo = (index) => {
        setActiveIndex(index);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setActiveIndex(null);
    };

    const handleNext = () => {
        // If this was the last video or there are no more videos to review
        if (evidencesToReview.length <= 1) {
            handleCloseModal();
            return;
        }

        setActiveIndex((prev) => (prev + 1) % evidencesToReview.length);
    };

    const handlePrevious = () => {
        if (evidencesToReview.length <= 1) {
            return;
        }

        setActiveIndex((prev) => (prev - 1 + evidencesToReview.length) % evidencesToReview.length);
    };

    // Handle when a video is successfully reviewed (approved or rejected)
    const handleVideoReviewed = (evidenceId) => {
        // Add the evidence ID to the list of reviewed evidences
        setReviewedEvidences(prev => [...prev, evidenceId]);

        // Refresh the data to get an updated list
        refetch();
    };

    // Load reviewed evidences from localStorage on component mount
    useEffect(() => {
        const savedReviewedEvidences = localStorage.getItem(`reviewedEvidences-${id}`);
        if (savedReviewedEvidences) {
            setReviewedEvidences(JSON.parse(savedReviewedEvidences));
        }
    }, [id]);

    // Save reviewed evidences to localStorage when it changes
    useEffect(() => {
        if (reviewedEvidences.length > 0) {
            localStorage.setItem(`reviewedEvidences-${id}`, JSON.stringify(reviewedEvidences));
        }
    }, [reviewedEvidences, id]);

    return (
        <div className="w-full mx-auto bg-black/20">
            <h2 className="text-xl font-bold text-center flex items-center justify-center gap-2 text-white">
                {t("VoteOther.title")}
                <div className="relative group cursor-pointer">
                    <svg
                        className="w-5 h-5 text-yellow-400 hover:text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10A8 8 0 11.001 10a8 8 0 0117.998 0zM11 14H9v-4h2v4zm0-6H9V7h2v1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div
                        className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-[280px] px-3 py-2 bg-black text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        {t("VoteOther.tooltip")}
                    </div>
                </div>
            </h2>
            {isLoading ? (
                <div
                    className="mx-1 py-10 px-6 max-w-xl text-center rounded-lg border-2 border-dotted border-orange-400 bg-white/10 text-white shadow-md">
                    <p className="text-lg font-medium">{t("VoteOther.loading")}</p>
                </div>
            ) : evidencesToReview.length === 0 ? (
                <div
                    className="mx-2 py-10 px-6 text-center rounded-lg border-2 border-dotted border-gray-300 bg-gray-50 text-gray-600 shadow-sm">
                    <p className="text-lg font-medium">{t("VoteOther.noEvidences")}</p>
                    <p className="text-sm mt-2 italic">{t("VoteOther.noPendingProofs")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {evidencesToReview.map((item, index) => (
                        <div
                            key={item?.evidenceId}
                            className="relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
                            onClick={() => handleOpenVideo(index)}
                        >
                            <video
                                src={item?.evidenceUrl}
                                muted
                                className="w-full h-80 object-cover rounded-lg"
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-1">
                                <FaPlayCircle className="text-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && activeIndex !== null && evidencesToReview.length > 0 && (
                <VideoModal
                    show={showModal}
                    onClose={handleCloseModal}
                    videoSrc={evidencesToReview[activeIndex]?.evidenceUrl}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    uploader={evidencesToReview[activeIndex]?.uploaderName || t("VoteOther.unknownUser")}
                    evidenceId={evidencesToReview[activeIndex]?.evidenceId}
                    isLastEvidence={activeIndex === evidencesToReview.length - 1}
                    onReviewed={handleVideoReviewed} // <<< ✨ Thêm dòng này
                />

            )}
            {!isVotedLoading && votedHistory.length > 0 && (
                <div className="mx-2">
                    <h3 className="text-lg font-semibold mb-3 text-center text-white">{t("VoteOther.historyTitle", "Your Voting History")}</h3>
                    <div className="overflow-x-auto rounded-lg shadow-md bg-white">
                        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                            <thead className="bg-orange-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">{t("VoteOther.table.submittedAt")}</th>
                                <th className="px-4 py-3 text-left">{t("VoteOther.table.reviewedAt")}</th>
                                <th className="px-4 py-3 text-center">{t("VoteOther.table.score")}</th>
                                <th className="px-4 py-3 text-left">{t("VoteOther.table.video")}</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {votedHistory.map((vote, idx) => (
                                <tr key={idx} className="hover:bg-orange-50 transition">
                                    <td className="px-4 py-2">{new Date(vote.submittedAt).toLocaleString()}</td>
                                    <td className="px-4 py-2">{new Date(vote.votedAt).toLocaleString()}</td>
                                    <td className="px-4 py-2 text-center font-semibold text-blue-600">{vote.score}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setShowModal(true);
                                                setActiveIndex(-1); // to indicate it's not from evidencesToReview
                                                setModalData({
                                                    evidenceUrl: vote.evidenceUrl,
                                                    evidenceId: vote.evidenceId,
                                                    uploaderName: vote.submitterName,
                                                });
                                            }}
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <FaPlayCircle/> {t("VoteOther.table.view")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {showModal && (
                        <VideoModal
                            show={showModal}
                            onClose={handleCloseModal}
                            videoSrc={
                                activeIndex !== -1
                                    ? evidencesToReview[activeIndex]?.evidenceUrl
                                    : modalData?.evidenceUrl
                            }
                            onPrevious={activeIndex !== -1 ? handlePrevious : undefined}
                            onNext={activeIndex !== -1 ? handleNext : undefined}
                            uploader={
                                activeIndex !== -1
                                    ? evidencesToReview[activeIndex]?.uploaderName || t("VoteOther.unknownUser")
                                    : modalData?.uploaderName
                            }
                            evidenceId={
                                activeIndex !== -1
                                    ? evidencesToReview[activeIndex]?.evidenceId
                                    : modalData?.evidenceId
                            }
                            isLastEvidence={
                                activeIndex === evidencesToReview.length - 1
                            }
                            onReviewed={handleVideoReviewed}
                        />
                    )}
                </div>

            )}
        </div>
    );
};

export default VoteOther;