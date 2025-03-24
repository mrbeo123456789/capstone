import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from "../../component/footer.jsx";
import { CheckCircle, XCircle } from "lucide-react";
import { useGetChallengesQuery, useReviewChallengeMutation } from "../../service/adminService.js";

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Lấy dữ liệu challenge từ API bằng hook
    const { data: challenge, isLoading, isError } = useGetChallengesQuery(id);
    const [reviewChallenge] = useReviewChallengeMutation();

    const [activeTab, setActiveTab] = useState('Information');
    const [searchText, setSearchText] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'confirmed' (approve) hoặc 'rejected' (reject)
    const [reason, setReason] = useState(""); // lý do người dùng nhập

    // Lọc thành viên (nếu có)
    const filteredMembers = challenge?.members?.filter(member =>
        member.username.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const handleGoBack = () => {
        navigate(-1);
    };

    // Mở modal xác nhận
    const openConfirmModal = (challengeId, action) => {
        setConfirmAction(action);
        setReason("");
        setShowConfirmModal(true);
    };

    // Hàm xử lý khi ấn OK trong modal xác nhận
    const handleConfirmAction = async () => {
        try {
            // Gọi API reviewChallenge để cập nhật trạng thái
            await reviewChallenge({
                id: challenge.id,
                status: confirmAction === 'confirmed' ? 'approved' : 'rejected',
                reason
            }).unwrap();
            alert(`Challenge #${challenge.id} ${confirmAction === 'confirmed' ? 'approved' : 'rejected'} with reason: "${reason}"`);
        } catch (error) {
            console.error("Error reviewing challenge:", error);
            alert("Có lỗi xảy ra khi duyệt challenge");
        }
        setShowConfirmModal(false);
    };

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

    if (isError || !challenge) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-red-600 text-xl font-bold mb-2">Lỗi</h2>
                    <p className="text-gray-700">Không thể tải thông tin challenge!</p>
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
            {/* Challenge header */}
            <div className="bg-white shadow">
                <div className="container mx-auto p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center">
                            {/* Giả lập icon, bạn có thể thay bằng hình ảnh thực */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-800">{challenge.title}</h1>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {challenge.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Nút duyệt challenge: nếu status là pending hiển thị cả 2 nút; nếu approved/rejected, chỉ hiển thị nút toggle */}
                    <div>
                        {challenge.status === "pending" ? (
                            <>
                                <button
                                    className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors mr-2"
                                    onClick={() => openConfirmModal(challenge.id, 'confirmed')}
                                >
                                    <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                    className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                    onClick={() => openConfirmModal(challenge.id, 'rejected')}
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </>
                        ) : (
                            <button
                                className={`p-2 rounded-md transition-colors ${
                                    challenge.status === "approved"
                                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                                        : "bg-green-100 text-green-600 hover:bg-green-200"
                                }`}
                                onClick={() =>
                                    challenge.status === "approved"
                                        ? openConfirmModal(challenge.id, 'rejected')
                                        : openConfirmModal(challenge.id, 'confirmed')
                                }
                            >
                                {challenge.status === "approved" ? (
                                    <XCircle className="h-5 w-5" />
                                ) : (
                                    <CheckCircle className="h-5 w-5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto">
                    <div className="flex">
                        {['Information', 'Tutorial', 'Ranking', 'Members'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 font-medium text-sm transition-colors duration-200 ${
                                    activeTab === tab
                                        ? 'bg-indigo-100 text-indigo-800 border-b-2 border-indigo-600'
                                        : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Nội dung các tab */}

            {/* Modal Xác Nhận Approve/Reject */}
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

            <Footer />
        </div>
    );
};

export default ChallengeDetail;
