import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegClock } from "react-icons/fa";
import { FaRunning } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import {CheckCircle, XCircle, UserX, ArrowLeft, Ban} from "lucide-react";
import Footer from "../../../component/footer.jsx";
import { useGetChallengeDetailQuery } from "../../../service/challengeService.js";
import { useReviewChallengeMutation } from "../../../service/adminService.js";
import EvidenceList from "../list/EvidenceList.jsx"; // Import the EvidenceList component

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("info");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'confirmed' or 'rejected'
    const [reason, setReason] = useState("");
    const [showKickModal, setShowKickModal] = useState(false);
    const [memberToKick, setMemberToKick] = useState(null);

    // Sử dụng API thật qua hook RTK Query để lấy chi tiết challenge
    const { data: challenge, error, isLoading ,refetch} = useGetChallengeDetailQuery(id);
    const [reviewChallenge] = useReviewChallengeMutation();
    console.log(challenge);
    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoToList = () => {
        navigate('/admin/challengelist'); // Adjust this path to your actual challenge list route
    };

    // Mở modal xác nhận với challenge_id và hành động (approve/reject)
    const handleAction = async (challengeId, action) => {
        const newStatus = action === "confirmed" ? "APPROVED" : "REJECTED";
        try {
            const reviewRequest = { challengeId, status: newStatus };
            const response = await reviewChallenge(reviewRequest).unwrap();
            console.log("Review challenge response:", response);
            refetch();
        } catch (error) {
            console.error(`Error ${action} challenge:`, error);
        }
    };
    const banChallenge = async (challengeId) => {
        try {
            const reviewRequest = { challengeId, status: "BANNED" };
            const response = await reviewChallenge(reviewRequest).unwrap();
            console.log("Ban challenge response:", response);
            refetch();
        } catch (error) {
            console.error("Error banning challenge:", error);
        }
    };

    // Mở modal kick thành viên
    const openKickModal = (member) => {
        setMemberToKick(member);
        setReason("");
        setShowKickModal(true);
    };

    // Xử lý khi kick thành viên
    const handleKickMember = () => {
        // Ở đây bạn có thể gọi API để kick thành viên khỏi challenge
        alert(`Đã kick thành viên ${memberToKick.name} với lý do: "${reason}"`);
        setShowKickModal(false);
    };

    // Mock data cho bảng xếp hạng - thay thế bằng dữ liệu thật từ API
    const mockParticipants = [
        { id: 1, name: "Nguyễn Văn A", score: 1250, rank: 1, avatar: "https://i.pravatar.cc/150?img=1" },
        { id: 2, name: "Trần Thị B", score: 980, rank: 2, avatar: "https://i.pravatar.cc/150?img=2" },
        { id: 3, name: "Lê Văn C", score: 875, rank: 3, avatar: "https://i.pravatar.cc/150?img=3" },
        { id: 4, name: "Phạm Thị D", score: 720, rank: 4, avatar: "https://i.pravatar.cc/150?img=4" },
        { id: 5, name: "Hoàng Văn E", score: 650, rank: 5, avatar: "https://i.pravatar.cc/150?img=5" }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin challenge...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-red-600 text-xl font-bold mb-2">Lỗi</h2>
                    <p className="text-gray-700">Có lỗi xảy ra khi tải thông tin challenge!</p>
                    <button
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                        onClick={handleGoBack}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-indigo-600 text-xl font-bold mb-2">Không tìm thấy</h2>
                    <p className="text-gray-700">Không tìm thấy thông tin challenge có ID {id}</p>
                    <button
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                        onClick={handleGoBack}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100">
            {/* Return button - added to top left */}
            <div className="p-4">
                <button
                    onClick={handleGoToList}
                    className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Trở về danh sách
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
                        <h2 className="text-xl font-bold text-gray-900">ĐÁNH GIÁ</h2>
                        <div className="mt-2">
                            {(() => {
                                const status = challenge.status.toUpperCase();
                                if (status === "PENDING") {
                                    return (
                                        <>
                                            <button
                                                className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                onClick={() => handleAction(challenge.id, "confirmed")}
                                            >
                                                <CheckCircle className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                onClick={() => handleAction(challenge.id, "rejected")}
                                            >
                                                <XCircle className="h-5 w-5" />
                                            </button>
                                        </>
                                    );
                                } else if (status === "REJECTED") {
                                    return (
                                        <button
                                            className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                            onClick={() => handleAction(challenge.id, "confirmed")}
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                        </button>
                                    );
                                } else if (status === "BANNED" || status === "FINISH" || status === "CANCELED") {
                                    return null;
                                } else {
                                    return (
                                        <button
                                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                            onClick={() => banChallenge(challenge.id)}
                                        >
                                            <Ban className="h-5 w-5" />
                                        </button>
                                    );
                                }
                            })()}
                        </div>
                        <div className="mt-4 flex items-center">
                            <FaRegClock className="text-gray-500 mr-2"/>
                            <p className="text-gray-700 text-sm">
                                Thời gian: {new Date(challenge.startDate).toLocaleDateString('vi-VN')} - {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center">
                            <FaRunning className="text-gray-500 mr-2" />
                            <p className="text-gray-700 text-sm">Trạng thái: {challenge.challengeType}</p>
                        </div>
                        <div className="mt-4 flex items-center text-lg font-semibold text-orange-500">
                            <HiUsers className="mr-2" />
                            <p>{challenge.participantCount} người đã tham gia</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-6 w-full">
                    <div className="flex border-b">
                        {["info", "rules", "rankings", "evidence"].map((tab) => (
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
                                    ? "Thông tin"
                                    : tab === "rules"
                                        ? "Quy định"
                                        : tab === "rankings"
                                            ? "Bảng xếp hạng"
                                            : "Bằng chứng"}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === "evidence" ? (
                        // Evidence Tab - Full width like Challenge Banner Section
                        <div className="w-full bg-white shadow-md rounded-lg mt-4">
                            <EvidenceList challengeData={challenge} />
                        </div>
                    ) : (
                        // Other Tabs - Original layout
                        <div className="p-6 bg-white shadow-md rounded-lg mt-4 max-w-4xl mx-auto">
                            {activeTab === "info" && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {challenge.name}
                                    </h2>
                                    <p className="text-gray-500 mt-2">
                                        {new Date(challenge.startDate).toLocaleDateString('vi-VN')} - {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-2">
                                        Người tạo: <span className="text-blue-500 font-semibold">{challenge.created_by}</span>
                                    </p>
                                    <p className="text-sm text-gray-700 mt-2">
                                        Số người tham gia: <span className="text-blue-500 font-semibold">{challenge.participantCount}</span>
                                    </p>

                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            MÔ TẢ
                                        </h3>
                                        <p className="text-gray-700 mt-2">
                                            {challenge.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            TÓM TẮT
                                        </h3>
                                        <p className="text-gray-700 mt-2">
                                            {challenge.summary || "Không có tóm tắt được cung cấp cho thử thách này."}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {activeTab === "rules" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">QUY ĐỊNH</h3>
                                    <p className="text-gray-700 mt-2">
                                        {challenge.rule || "Không có quy định được cung cấp cho thử thách này."}
                                    </p>
                                </div>
                            )}
                            {activeTab === "rankings" && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">BẢNG XẾP HẠNG</h3>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="min-w-full bg-white">
                                            <thead>
                                            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                                <th className="py-3 px-6 text-left">Xếp hạng</th>
                                                <th className="py-3 px-6 text-left">Thành viên</th>
                                                <th className="py-3 px-6 text-right">Điểm số</th>
                                                <th className="py-3 px-6 text-center">Hành động</th>
                                            </tr>
                                            </thead>
                                            <tbody className="text-gray-600 text-sm">
                                            {mockParticipants.map((participant) => (
                                                <tr key={participant.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-6 text-left whitespace-nowrap">
                                                        <div className="flex items-center">
                                                                <span className={`
                                                                    w-8 h-8 rounded-full flex items-center justify-center
                                                                    ${participant.rank === 1 ? 'bg-yellow-400' :
                                                                    participant.rank === 2 ? 'bg-gray-300' :
                                                                        participant.rank === 3 ? 'bg-orange-300' : 'bg-gray-200'}
                                                                    text-white font-bold
                                                                `}>
                                                                    {participant.rank}
                                                                </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-left">
                                                        <div className="flex items-center">
                                                            <div className="mr-2">
                                                                <img className="w-8 h-8 rounded-full" src={participant.avatar} alt={participant.name} />
                                                            </div>
                                                            <span>{participant.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <span className="font-bold">{participant.score}</span>
                                                    </td>
                                                    <td className="py-3 px-6 text-center">
                                                        <button
                                                            onClick={() => openKickModal(participant)}
                                                            className="bg-red-100 text-red-600 py-1 px-3 rounded-full text-xs flex items-center justify-center mx-auto hover:bg-red-200"
                                                        >
                                                            <UserX className="h-3 w-3 mr-1" /> Kick
                                                        </button>
                                                    </td>
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

            {/* Modal xác nhận Approve/Reject */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">
                            Confirm {confirmAction === 'confirmed' ? 'Approve' : 'Reject'}?
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Are you sure {confirmAction === 'confirmed' ? 'approve' : 'reject'} this challenge?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do (tuỳ chọn):</label>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                rows="3"
                                placeholder="Nhập lý do..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 rounded text-white ${
                                    confirmAction === 'confirmed'
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                }`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận Kick thành viên */}
            {showKickModal && memberToKick && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">
                            Confirm kick member
                        </h2>
                        <div className="flex items-center mb-4">
                            <img className="w-10 h-10 rounded-full mr-3" src={memberToKick.avatar} alt={memberToKick.name} />
                            <span className="font-medium">{memberToKick.name}</span>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Do you sure to kick this member from the challenge?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do loại bỏ:</label>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                rows="3"
                                placeholder="Reason why you delete ..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowKickModal(false)}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleKickMember}
                                className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
                            >
                                Loại bỏ
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