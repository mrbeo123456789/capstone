import { useState, useEffect } from "react";
import { FaPlayCircle } from "react-icons/fa";
import VideoModal from "../ui/VideoModal.jsx";
import {
    useGetEvidencesToReviewQuery,
} from "../../service/evidenceService.js";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const VoteOther = () => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reviewedEvidences, setReviewedEvidences] = useState([]);

    const { id } = useParams(); // Get challenge ID from URL
    const { data = [], isLoading, refetch } = useGetEvidencesToReviewQuery(id);

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
        <div className="w-full mx-auto">
            <h2 className="text-xl font-bold text-center">{t("VoteOther.title")}</h2>

            {isLoading ? (
                <div className="text-center py-10">{t("VoteOther.loading")}</div>
            ) : evidencesToReview.length === 0 ? (
                <div className="text-center py-10 text-gray-500">{t("VoteOther.noEvidences")}</div>
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
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                                {item?.uploaderName || t("VoteOther.unknownUser")}
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
                    onNext={() => {
                        // The VideoModal component already has its own logic for the next functionality
                        // This is just a fallback if needed
                        handleNext();
                    }}
                    uploader={evidencesToReview[activeIndex]?.uploaderName || t("VoteOther.unknownUser")}
                    evidenceId={evidencesToReview[activeIndex]?.evidenceId}
                    isLastEvidence
                />
            )}
        </div>
    );
};

export default VoteOther;