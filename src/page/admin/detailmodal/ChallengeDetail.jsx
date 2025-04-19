import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegClock } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { CheckCircle, XCircle, ArrowLeft, Ban, UserX } from "lucide-react";
import Footer from "../../../component/footer.jsx";
import { useGetChallengeDetailQuery } from "../../../service/challengeService.js";
import { useReviewChallengeMutation } from "../../../service/adminService.js";
import EvidenceList from "../list/EvidenceList.jsx";

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("info");
    const { data: challenge, error, isLoading, refetch } = useGetChallengeDetailQuery(id);
    console.log(challenge);
    const [reviewChallenge] = useReviewChallengeMutation();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState("");
    const [message, setMessage] = useState("");
    const [actionError, setActionError] = useState("");

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoToList = () => {
        navigate('/admin/challengemanagement');
    };

    // Open modal when user clicks action button
    const openActionModal = (action) => {
        setActionType(action);
        setMessage("");
        setActionError("");
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setActionType("");
        setMessage("");
        setActionError("");
    };

    // Xử lý submit modal
    const handleModalSubmit = async () => {
        if (!id || !actionType) return;

        let newStatus;
        switch (actionType) {
            case "confirmed":
                newStatus = "APPROVED";
                break;
            case "rejected":
                newStatus = "REJECTED";
                break;
            case "banned":
                newStatus = "BANNED";
                break;
            default:
                return;
        }

        try {
            setActionError("");

            // Đảm bảo gửi đúng format dữ liệu mà backend mong đợi
            const reviewRequest = {
                challengeId: id,
                status: newStatus,
                adminNote: message // Include message in request
            };

            console.log("Sending review request:", reviewRequest);
            const result = await reviewChallenge(reviewRequest);

            // Check if there is an error in the response
            if (result.error) {
                // If there's an error but the status is 200, it's likely a parsing error
                // but the operation was successful
                if (result.error.originalStatus === 200) {
                    console.log("Operation successful despite parsing error");
                    closeModal();
                    refetch();
                } else {
                    // Real error
                    console.error(`Error ${actionType} challenge:`, result.error);
                    setActionError(`Error: ${result.error.data || 'Unknown error occurred'}`);
                }
            } else {
                // Success
                console.log(`Challenge ${actionType} successful:`, result.data);
                closeModal();
                refetch();
            }
        } catch (error) {
            console.error(`Error ${actionType} challenge:`, error);
            setActionError(`Error: ${error.message || 'Unknown error occurred'}`);
        }
    };

    // Hàm lấy tiêu đề cho modal dựa trên action type
    const getModalTitle = () => {
        switch (actionType) {
            case "confirmed":
                return "Approve Challenge";
            case "rejected":
                return "Reject Challenge";
            case "banned":
                return "Ban Challenge";
            default:
                return "Review Challenge";
        }
    };

    // Hàm lấy placeholder text cho message input dựa trên action type
    const getMessagePlaceholder = () => {
        switch (actionType) {
            case "confirmed":
                return "Enter approval message for the challenge owner...";
            case "rejected":
                return "Enter reason for rejection...";
            case "banned":
                return "Enter reason for banning this challenge...";
            default:
                return "Enter message for the user...";
        }
    };

    const kickParticipant = (participantId) => {
        // Implement kick member functionality here
        console.log(`Kicking participant with ID: ${participantId}`);
        // Add actual API call to kick participant
        alert(`Participant ${participantId} has been kicked from the challenge`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading challenge information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-red-600 text-xl font-bold mb-2">Error</h2>
                    <p className="text-gray-700">Error loading challenge information!</p>
                    <button
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                        onClick={handleGoBack}
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-indigo-600 text-xl font-bold mb-2">Not Found</h2>
                    <p className="text-gray-700">Could not find challenge with ID {id}</p>
                    <button
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                        onClick={handleGoBack}
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100">
            {/* Return button */}
            <div className="p-4">
                <button
                    onClick={handleGoToList}
                    className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Return to list
                </button>
            </div>

            <div className="p-6 flex flex-col items-center w-full">
                {/* Challenge Banner Section */}
                <div className="w-full flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
                    {challenge.picture ? (
                        <img
                            src={challenge.picture}
                            alt={challenge.name}
                            className="w-full md:w-2/3 object-cover"
                        />
                    ) : (
                        <div className="w-full md:w-2/3 bg-gray-200 flex items-center justify-center h-64">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    <div className="bg-gray-100 p-6 md:w-1/3 flex flex-col justify-between">
                        <h2 className="text-xl font-bold text-gray-900">CHALLENGE INFO</h2>
                        <div className="mt-2 text-sm text-gray-700">
                            <p>Challenge Type: {challenge.challengeType}</p>
                            <p>Verification: {challenge.verificationType ? challenge.verificationType.toString() : "N/A"}</p>
                            <p>Participation: {challenge.participationType ? challenge.participationType.toString() : "N/A"}</p>
                            <p>Duration: {challenge.duration} days</p>
                        </div>
                        <div className="mt-4 flex items-center">
                            <FaRegClock className="text-gray-500 mr-2" />
                            <p className="text-gray-700 text-sm">
                                {new Date(challenge.startDate).toLocaleDateString('vi-VN')} - {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center text-lg font-semibold text-orange-500">
                            <HiUsers className="mr-2" />
                            <p>{challenge.participantCount} participants</p>
                        </div>
                        <div className="mt-4">
                            {(() => {
                                const status = challenge.challengeStatus
                                    ? challenge.challengeStatus.toString().toLowerCase()
                                    : "";
                                console.log(status);
                                if (status === "banned" || status === "finish" || status === "cancel") {
                                    return null;
                                }
                                if (status === "pending") {
                                    return (
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                onClick={() => openActionModal("confirmed")}
                                                title="Approve Challenge"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button
                                                className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                onClick={() => openActionModal("rejected")}
                                                title="Reject Challenge"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    );
                                }
                                if (status === "rejected") {
                                    return (
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                onClick={() => openActionModal("confirmed")}
                                                title="Approve Challenge"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        </div>
                                    );
                                }
                                if (status === "ongoing" || status === "upcoming") {
                                    return (
                                        <button
                                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                            onClick={() => openActionModal("banned")}
                                            title="Ban Challenge"
                                        >
                                            <Ban size={18} />
                                        </button>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-6 w-full">
                    <div className="flex border-b">
                        {["info", "rules", "members", "evidence"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 text-center py-3 font-semibold ${
                                    activeTab === tab
                                        ? "text-orange-500 border-b-4 border-orange-500"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab === "info"
                                    ? "Information"
                                    : tab === "rules"
                                        ? "Rules"
                                        : tab === "members"
                                            ? "Members"
                                            : "Evidence"}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === "evidence" ? (
                        // Evidence Tab: Chuyển toàn bộ đối tượng challenge sang EvidenceList
                        <div className="w-full mt-4">
                            <EvidenceList challengeId={challenge.id} />
                        </div>
                    ) : (
                        <div className="p-6 bg-white shadow-md rounded-lg mt-4 max-w-4xl mx-auto">
                            {activeTab === "info" && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{challenge.name}</h2>
                                    <p className="text-gray-500 mt-2">
                                        {new Date(challenge.startDate).toLocaleDateString('vi-VN')} - {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                                    </p>
                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="text-lg font-semibold text-gray-800">DESCRIPTION</h3>
                                        <p className="text-gray-700 mt-2">{challenge.description}</p>
                                    </div>
                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="text-lg font-semibold text-gray-800">SUMMARY</h3>
                                        <p className="text-gray-700 mt-2">
                                            {challenge.summary || "No summary provided for this challenge."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "rules" && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Challenge Rules</h2>
                                    <div className="mt-4">
                                        <p className="text-gray-500 italic">No rules have been specified for this challenge.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === "members" && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Participant members</h2>
                                    {/* Sử dụng dữ liệu mock cho members */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white">
                                            <thead>
                                            <tr className="bg-orange-100 text-gray-700">
                                                <th className="py-3 px-4 text-left">Rank</th>
                                                <th className="py-3 px-4 text-left">Participant</th>
                                                <th className="py-3 px-4 text-center">Actions</th>
                                                <th className="py-3 px-4 text-right">Score</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {[
                                                { id: 1, name: "Nguyễn Văn A", score: 1250, rank: 1, avatar: "https://i.pravatar.cc/150?img=1" },
                                                { id: 2, name: "Trần Thị B", score: 980, rank: 2, avatar: "https://i.pravatar.cc/150?img=2" },
                                                { id: 3, name: "Lê Văn C", score: 875, rank: 3, avatar: "https://i.pravatar.cc/150?img=3" },
                                                { id: 4, name: "Phạm Thị D", score: 720, rank: 4, avatar: "https://i.pravatar.cc/150?img=4" },
                                                { id: 5, name: "Hoàng Văn E", score: 650, rank: 5, avatar: "https://i.pravatar.cc/150?img=5" },
                                            ].map((participant) => (
                                                <tr key={participant.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium">#{participant.rank}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center">
                                                            <img src={participant.avatar} alt={participant.name} className="h-8 w-8 rounded-full mr-3" />
                                                            <span>{participant.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <button
                                                            onClick={() => kickParticipant(participant.id)}
                                                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                            title="Kick member"
                                                        >
                                                            <UserX size={18} />
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold">{participant.score}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Component */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-orange-100">
                            <h3 className="text-lg font-semibold text-orange-700">{getModalTitle()}</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message to User
                                </label>
                                <textarea
                                    id="message"
                                    rows="4"
                                    className="w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    placeholder={getMessagePlaceholder()}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                {actionType === "confirmed" && "This message will be sent to the user when the challenge is approved."}
                                {actionType === "rejected" && "This message will explain to the user why their challenge was rejected."}
                                {actionType === "banned" && "This message will inform the user that their challenge has been banned."}
                            </p>

                            {actionError && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                                    {actionError}
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md text-white ${
                                    actionType === "confirmed"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : actionType === "rejected" || actionType === "banned"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-orange-600 hover:bg-orange-700"
                                }`}
                                onClick={handleModalSubmit}
                            >
                                {actionType === "confirmed" ? "Approve" : actionType === "rejected" ? "Reject" : actionType === "banned" ? "Ban" : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ChallengeDetail;