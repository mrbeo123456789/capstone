import { useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import VideoModal from "../ui/VideoModal.jsx";
import {
    useGetEvidencesToReviewQuery,
    useReviewEvidenceMutation,
    useUploadEvidenceMutation
} from "../../service/evidenceService.js";
import {useParams} from "react-router-dom";

const voteItems = [
    {
        id: 1,
        user: "User 1",
        proofVideo:
            "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413994190239.mp4?alt=media&token=351a5004-2545-43db-a733-066c3548d0b1",
    },
    {
        id: 2,
        user: "User 2",
        proofVideo:
            "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2F6413970929387.mp4?alt=media&token=5e9a0462-7656-4cd7-b355-0862ca60638d",
    },
    {
        id: 3,
        user: "User 3",
        proofVideo:
            "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/vids%2Fdownload.mp4?alt=media&token=5305f5e0-dbd8-417d-9600-97274f19907a",
    },
];

const VoteOther = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { id } = useParams(); // Lấy challenge ID từ URL
    const { data, isLoading } = useGetEvidencesToReviewQuery(id);
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
        setActiveIndex((prev) => (prev + 1) % voteItems.length);
    };

    const handlePrevious = () => {
        setActiveIndex((prev) => (prev - 1 + voteItems.length) % voteItems.length);
    };

    return (
        <div className="mt-6 w-full mx-auto p-4">
            <h2 className="text-xl font-bold mb-6 text-center">Vote for Others' Proof</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {voteItems.map((item, index) => (
                    <div
                        key={item.id}
                        className="relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
                        onClick={() => handleOpenVideo(index)}
                    >
                        <video
                            src={item.proofVideo}
                            muted
                            className="w-full h-80 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-1">
                            <FaPlayCircle className="text-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {showModal && activeIndex !== null && (
                <VideoModal
                    show={showModal}
                    onClose={handleCloseModal}
                    videoSrc={voteItems[activeIndex].proofVideo}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    uploader={voteItems[activeIndex].user}
                />
            )}
        </div>
    );
};

export default VoteOther;
