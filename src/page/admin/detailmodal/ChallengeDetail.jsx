import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaRegClock } from "react-icons/fa";
import { FaRunning } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { CheckCircle, XCircle, UserX, ArrowLeft, Camera, FileText } from "lucide-react";
import Footer from "../../component/footer.jsx";
import { useGetChallengeDetailQuery } from "../../service/challengeService.js";
import EvidenceDetailModal from "./EvidenceDetailModal"; // Import the EvidenceDetailModal component

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("info");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'confirmed' or 'rejected'
    const [reason, setReason] = useState("");
    const [showKickModal, setShowKickModal] = useState(false);
    const [memberToKick, setMemberToKick] = useState(null);
    // Add state for evidence modal
    const [selectedEvidence, setSelectedEvidence] = useState(null);

    // Sử dụng API thật qua hook RTK Query để lấy chi tiết challenge
    const { data: challenge, error, isLoading } = useGetChallengeDetailQuery(id);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoToList = () => {
        navigate('/admin/challengelist'); // Adjust this path to your actual challenge list route
    };

    // Mở modal xác nhận với challenge_id và hành động (approve/reject)
    const openConfirmModal = (challengeId, action) => {
        setConfirmAction(action);
        setReason("");
        setShowConfirmModal(true);
    };

    // Xử lý khi nhấn OK trên modal xác nhận
    const handleConfirmAction = () => {
        // Ở đây bạn có thể gọi API cập nhật trạng thái challenge nếu cần.
        alert(`Challenge #${challenge.challenge_id} ${confirmAction === 'confirmed' ? 'approved' : 'rejected'} with reason: "${reason}"`);
        setShowConfirmModal(false);
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

    // Handle opening evidence detail modal
    const openEvidenceDetail = (evidence, memberName) => {
        // Format the evidence data for the modal
        const formattedEvidence = {
            id: evidence.id,
            name: evidence.title,
            challenge: challenge.name,
            addedBy: memberName,
            dateAdded: evidence.date,
            type: evidence.type,
            status: evidence.status,
            // Add any other fields required by EvidenceDetailModal
        };
        setSelectedEvidence(formattedEvidence);
    };

    // Handle evidence approval
    const handleApproveEvidence = (evidenceId) => {
        // Implement API call to approve evidence
        console.log(`Evidence approved: ${evidenceId}`);
        setSelectedEvidence(null);
        // You might want to refresh the evidence list here
    };

    // Handle evidence rejection
    const handleRejectEvidence = (evidenceId) => {
        // Implement API call to reject evidence
        console.log(`Evidence rejected: ${evidenceId}`);
        setSelectedEvidence(null);
        // You might want to refresh the evidence list here
    };

    // Close evidence modal
    const closeEvidenceModal = () => {
        setSelectedEvidence(null);
    };

    // Mock data cho bảng xếp hạng - thay thế bằng dữ liệu thật từ API
    const mockParticipants = [
        { id: 1, name: "Nguyễn Văn A", score: 1250, rank: 1, avatar: "https://i.pravatar.cc/150?img=1" },
        { id: 2, name: "Trần Thị B", score: 980, rank: 2, avatar: "https://i.pravatar.cc/150?img=2" },
        { id: 3, name: "Lê Văn C", score: 875, rank: 3, avatar: "https://i.pravatar.cc/150?img=3" },
        { id: 4, name: "Phạm Thị D", score: 720, rank: 4, avatar: "https://i.pravatar.cc/150?img=4" },
        { id: 5, name: "Hoàng Văn E", score: 650, rank: 5, avatar: "https://i.pravatar.cc/150?img=5" }
    ];

    // Mock data cho bằng chứng - thay thế bằng dữ liệu thật từ API
    const mockEvidence = [
        {
            id: 1,
            memberId: 1,
            memberName: "Nguyễn Văn A",
            memberAvatar: "https://i.pravatar.cc/150?img=1",
            evidences: [
                { id: 101, type: "image", title: "Đã hoàn thành 5km chạy", date: "2023-08-15", status: "approved", url: "/api/placeholder/400/320" },
                { id: 102, type: "text", title: "Báo cáo tuần 1", date: "2023-08-16", status: "pending", content: "Tôi đã hoàn thành mục tiêu tuần đầu tiên..." }
            ]
        },
        {
            id: 2,
            memberId: 2,
            memberName: "Trần Thị B",
            memberAvatar: "https://i.pravatar.cc/150?img=2",
            evidences: [
                { id: 103, type: "image", title: "Kết quả chạy 10km", date: "2023-08-14", status: "approved", url: "/api/placeholder/400/320" },
                { id: 104, type: "image", title: "Hình ảnh tập luyện", date: "2023-08-17", status: "rejected", url: "/api/placeholder/400/320" }
            ]
        },
        {
            id: 3,
            memberId: 3,
            memberName: "Lê Văn C",
            memberAvatar: "https://i.pravatar.cc/150?img=3",
            evidences: [
                { id: 105, type: "text", title: "Báo cáo tuần 2", date: "2023-08-20", status: "approved", content: "Tuần này tôi đã vượt qua mốc 20km..." }
            ]
        }
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
                            {challenge.status === "PENDING" ? (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openConfirmModal(challenge.challenge_id, 'confirmed')}
                                        className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center"
                                    >
                                        <CheckCircle className="h-5 w-5 mr-1" /> Approve
                                    </button>
                                    <button
                                        onClick={() => openConfirmModal(challenge.challenge_id, 'rejected')}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center"
                                    >
                                        <XCircle className="h-5 w-5 mr-1" /> Reject
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className={`w-full py-2 rounded-lg text-white flex items-center justify-center ${
                                        challenge.status === "APPROVED"
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-green-500 hover:bg-green-600"
                                    }`}
                                    onClick={() =>
                                        challenge.status === "APPROVED"
                                            ? openConfirmModal(challenge.challenge_id, 'rejected')
                                            : openConfirmModal(challenge.challenge_id, 'confirmed')
                                    }
                                >
                                    {challenge.status === "APPROVED" ? (
                                        <><XCircle className="h-5 w-5 mr-1" /> Reject</>
                                    ) : (
                                        <><CheckCircle className="h-5 w-5 mr-1" /> Approve</>
                                    )}
                                </button>
                            )}
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
                <div className="mt-6 w-full max-w-4xl">
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
                    <div className="p-6 bg-white shadow-md rounded-lg mt-4">
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

                                {/* Moved summary section into info tab */}
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
                        {activeTab === "evidence" && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">BẰNG CHỨNG</h3>

                                {mockEvidence.map((member) => (
                                    <div key={member.id} className="mb-6 border-b pb-4">
                                        <div className="flex items-center mb-3">
                                            <h4 className="font-semibold text-gray-800">{member.memberName}</h4>
                                        </div>

                                        <div className="pl-4 border-l-4 border-orange-200">
                                            {member.evidences.map((evidence) => (
                                                <div key={evidence.id} className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center">
                                                            {evidence.type === "image" ? (
                                                                <Camera size={16} className="text-blue-500 mr-2" />
                                                            ) : (
                                                                <FileText size={16} className="text-green-500 mr-2" />
                                                            )}
                                                            <h5 className="font-medium">{evidence.title}</h5>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-xs text-gray-500 mr-2">{evidence.date}</span>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                evidence.status === "approved"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : evidence.status === "rejected"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : "bg-yellow-100 text-yellow-700"
                                                            }`}>
                                                                {evidence.status === "approved" ? "Đã duyệt" : evidence.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {evidence.type === "image" ? (
                                                        <div className="mt-2">
                                                            <img src={evidence.url} alt={evidence.title} className="w-full max-h-64 object-contain rounded-lg" />
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                                                            <p className="text-gray-700 text-sm">{evidence.content}</p>
                                                        </div>
                                                    )}

                                                    <div className="mt-3 flex justify-end space-x-2">
                                                        {evidence.status === "pending" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApproveEvidence(evidence.id)}
                                                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                                >
                                                                    Phê duyệt
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectEvidence(evidence.id)}
                                                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                                                >
                                                                    Từ chối
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => openEvidenceDetail(evidence, member.memberName)}
                                                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                        >
                                                            Chi tiết
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {mockEvidence.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Chưa có bằng chứng nào được gửi lên cho thử thách này.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal xác nhận Approve/Reject */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">
                            Xác nhận {confirmAction === 'confirmed' ? 'Approve' : 'Reject'}?
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Bạn có chắc chắn muốn {confirmAction === 'confirmed' ? 'approve' : 'reject'} challenge này không?
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
                                Hủy
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
                            Xác nhận loại bỏ thành viên
                        </h2>
                        <div className="flex items-center mb-4">
                            <img className="w-10 h-10 rounded-full mr-3" src={memberToKick.avatar} alt={memberToKick.name} />
                            <span className="font-medium">{memberToKick.name}</span>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Bạn có chắc chắn muốn loại bỏ thành viên này khỏi challenge không?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do loại bỏ:</label>
                            <textarea
                                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                rows="3"
                                placeholder="Nhập lý do loại bỏ thành viên..."
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

            {/* Evidence Detail Modal */}
            {selectedEvidence && (
                <EvidenceDetailModal
                    evidence={selectedEvidence}
                    onClose={closeEvidenceModal}
                    onApprove={handleApproveEvidence}
                    onReject={handleRejectEvidence}
                />
            )}

            <Footer />
        </div>
    );
};

export default ChallengeDetail;