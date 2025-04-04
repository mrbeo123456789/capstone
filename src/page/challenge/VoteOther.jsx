import { useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import VideoModal from "../ui/VideoModal.jsx";
import {
    useGetEvidencesToReviewQuery,
    useReviewEvidenceMutation,
    useUploadEvidenceMutation
} from "../../service/evidenceService.js";
import { useParams } from "react-router-dom";

const VoteOther = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { id } = useParams(); // Get challenge ID from URL
    const { data = [], isLoading } = useGetEvidencesToReviewQuery(id);
    const [reviewEvidence] = useReviewEvidenceMutation();
    const [uploadEvidence] = useUploadEvidenceMutation();

    const handleOpenVideo = (index) => {
        setActiveIndex(index);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setActiveIndex(null);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % data.length);
    };

    const handlePrevious = () => {
        setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
    };

    return (
        <div className="mt-6 w-full mx-auto p-4">
            <h2 className="text-xl font-bold mb-6 text-center">Vote for Others' Proof</h2>

            {isLoading ? (
                <div className="text-center py-10">Loading videos...</div>
            ) : data.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No evidences to review.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {data.map((item, index) => (
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

            {showModal && activeIndex !== null && (
                <VideoModal
                    show={showModal}
                    onClose={handleCloseModal}
                    videoSrc={data[activeIndex]?.evidenceUrl}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    uploader={data[activeIndex]?.uploaderName || "Unknown User"}
                />
            )}
        </div>
    );
};

export default VoteOther;
