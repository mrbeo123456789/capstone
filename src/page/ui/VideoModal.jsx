import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useReviewEvidenceMutation } from "../../service/evidenceService";
import { toast } from "react-toastify"; // ✅

const VideoModal = ({ show, onClose, videoSrc, onPrevious, onNext, uploader, evidenceId }) => {
    if (!show) return null;
    const [reviewEvidence] = useReviewEvidenceMutation();

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
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 p-4 bg-gray-100">
                    <button
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
                        onClick={async () => {
                            try {
                                await reviewEvidence({
                                    evidenceId: evidenceId,
                                    isApproved: false,
                                    feedback: "I don't approve this video"
                                }).unwrap();
                                toast.success("Rejected successfully!");
                                onNext(); // Move to next video automatically
                            } catch (error) {
                                toast.error("Failed to reject!");
                                console.error(error);
                            }
                        }}
                    >
                        <FaTimesCircle className="text-2xl" />
                        I don't approve this video
                    </button>

                    <button
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
                        onClick={async () => {
                            try {
                                await reviewEvidence({
                                    evidenceId: evidenceId,
                                    isApproved: true,
                                    feedback: "I approve this video"
                                });
                                toast.success("Approved successfully!");
                                onNext(); // Move to next video automatically
                            } catch (error) {
                                toast.error("Failed to approve!");
                                console.error(error);
                            }
                        }}
                    >
                        <FaCheckCircle className="text-2xl" />
                        I approved this video
                    </button>
                </div>

            </div>

            {/* Previous Video Button */}
            <button
                onClick={onPrevious}
                className="absolute left-4 px-4 py-2 rounded-lg"
            >
                <div aria-label="Previous" role="button" tabIndex={0}
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
                <div aria-label="Next" role="button" tabIndex={0}
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
