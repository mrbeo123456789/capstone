import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useReviewEvidenceMutation } from "../../service/evidenceService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const VideoModal = ({ show, onClose, videoSrc, onPrevious, onNext, uploader, evidenceId }) => {
    const { t } = useTranslation();
    const [reviewEvidence] = useReviewEvidenceMutation();
    const [isReviewed, setIsReviewed] = useState(false);

    if (!show) return null;

    // Handle approving the video
    const handleApprove = async () => {
        if (isReviewed) return;

        try {
            await reviewEvidence({
                evidenceId: evidenceId,
                isApproved: true,
                feedback: t("VideoModal.approveMessage")
            }).unwrap();

            toast.success(t("VideoModal.approveSuccess"));
            setIsReviewed(true);

            // Add this evidence ID to localStorage to track it's been reviewed
            const reviewedKey = `reviewedEvidences-${evidenceId.split('-')[0]}`;
            const savedReviewed = JSON.parse(localStorage.getItem(reviewedKey) || "[]");
            if (!savedReviewed.includes(evidenceId)) {
                localStorage.setItem(reviewedKey, JSON.stringify([...savedReviewed, evidenceId]));
            }

            // Move to next video automatically after a short delay
            setTimeout(() => {
                onNext();
            }, 1000);
        } catch (error) {
            toast.error(t("VideoModal.approveFail"));
            console.error(error);
        }
    };

    // Handle rejecting the video
    const handleReject = async () => {
        if (isReviewed) return;

        try {
            await reviewEvidence({
                evidenceId: evidenceId,
                isApproved: false,
                feedback: t("VideoModal.rejectMessage")
            }).unwrap();

            toast.success(t("VideoModal.rejectSuccess"));
            setIsReviewed(true);

            // Add this evidence ID to localStorage to track it's been reviewed
            const reviewedKey = `reviewedEvidences-${evidenceId.split('-')[0]}`;
            const savedReviewed = JSON.parse(localStorage.getItem(reviewedKey) || "[]");
            if (!savedReviewed.includes(evidenceId)) {
                localStorage.setItem(reviewedKey, JSON.stringify([...savedReviewed, evidenceId]));
            }

            // Move to next video automatically after a short delay
            setTimeout(() => {
                onNext();
            }, 1000);
        } catch (error) {
            toast.error(t("VideoModal.rejectFail"));
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg relative flex flex-col h-[90%] w-[80%] overflow-hidden">
                {/* Close Button */}
                <button
                    className="absolute top-2 right-4 text-gray-300 text-3xl hover:text-white"
                    onClick={onClose}>
                    ×
                </button>

                {/* Video Player */}
                <div className="flex-1 bg-black flex justify-center items-center">
                    <video key={videoSrc} controls className="h-full rounded">
                        <source src={videoSrc} type="video/mp4" />
                        {t("VideoModal.browserNotSupported")}
                    </video>
                </div>

                {/* Action Buttons - Hide if already reviewed */}
                {!isReviewed && (
                    <div className="flex justify-center gap-4 p-4 bg-gray-100">
                        <button
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
                            onClick={handleReject}
                        >
                            <FaTimesCircle className="text-2xl" />
                            {t("VideoModal.rejectButton")}
                        </button>

                        <button
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
                            onClick={handleApprove}
                        >
                            <FaCheckCircle className="text-2xl" />
                            {t("VideoModal.approveButton")}
                        </button>
                    </div>
                )}

                {/* Show message if already reviewed */}
                {isReviewed && (
                    <div className="flex justify-center p-4 bg-gray-100">
                        <div className="text-green-600 font-bold text-lg">
                            {t("VideoModal.reviewSubmitted")}
                        </div>
                    </div>
                )}
            </div>

            {/* Previous Video Button */}
            <button
                onClick={onPrevious}
                className="absolute left-4 px-4 py-2 rounded-lg"
            >
                <div aria-label={t("VideoModal.previous")} role="button" tabIndex={0}
                     className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-500 hover:bg-white text-white hover:text-gray-700 transition">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M14.791 5.207 8 12l6.793 6.793a1 1 0 1 1-1.415 1.414l-7.5-7.5a1 1 0 0 1 0-1.414l7.5-7.5a1 1 0 1 1 1.415 1.414z"></path>
                    </svg>
                </div>
            </button>

            {/* Next Video Button */}
            <button
                onClick={onNext}
                className="absolute right-4 px-4 py-2 rounded-lg"
            >
                <div aria-label={t("VideoModal.next")} role="button" tabIndex={0}
                     className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-500 hover:bg-white text-white hover:text-gray-700 transition">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M9.209 5.207 16 12l-6.791 6.793a1 1 0 1 0 1.415 1.414l7.5-7.5a1 1 0 0 0 0-1.414l-7.5-7.5a1 1 0 1 0-1.415 1.414z"></path>
                    </svg>
                </div>
            </button>
        </div>
    );
};

export default VideoModal;