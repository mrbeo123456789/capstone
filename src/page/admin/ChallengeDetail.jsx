import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from "../../component/footer.jsx";

const ChallengeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Information');
    const [searchText, setSearchText] = useState('');

    // Sử dụng optional chaining để đảm bảo không gọi .filter trên null
    const filteredMembers = challenge?.members?.filter(member =>
        member.username.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    useEffect(() => {
        const fetchChallengeDetail = async () => {
            try {
                setLoading(true);
                // Giả lập API call – trong thực tế bạn sẽ gọi API thực
                const mockData = {
                    id: 1,
                    title: "Challenge name",
                    description: "Đây là mô tả chi tiết về challenge này.",
                    type: "Running",
                    startDate: "2025-03-10T10:00:00",
                    endDate: "2025-04-15T23:59:59",
                    creator: "AdminUser",
                    difficulty: "Trung bình",
                    points: 500,
                    submissionCount: 245,
                    successRate: 68,
                    requirements: [
                        "Phải hoàn thành trong thời gian quy định",
                        "Phải đáp ứng các yêu cầu kỹ thuật",
                        "Phải xử lý được tất cả các trường hợp đặc biệt"
                    ],
                    tutorial: {
                        type: "text",
                        content: "Hướng dẫn chi tiết về cách thực hiện challenge này."
                    },
                    ranking: [
                        { username: "user1", score: 980, time: "00:45:23" },
                        { username: "user2", score: 950, time: "00:48:12" },
                        { username: "user3", score: 920, time: "00:50:05" }
                    ],
                    members: [
                        { username: "member1", email: "member1@example.com", joinDate: "2025-03-12" },
                        { username: "member2", email: "member2@example.com", joinDate: "2025-03-13" },
                        { username: "member3", email: "member3@example.com", joinDate: "2025-03-14" },
                        { username: "member4", email: "member4@example.com", joinDate: "2025-03-15" }
                    ],
                    status: "pending", // pending, approved, rejected
                    createdAt: "2025-03-10T10:00:00",
                    tags: ["Algorithm", "Data Structure", "Optimization"]
                };

                setTimeout(() => {
                    setChallenge(mockData);
                    setLoading(false);
                }, 500);
            } catch (err) {
                setError("Có lỗi xảy ra khi tải thông tin challenge!");
                setLoading(false);
                console.error("Error fetching challenge:", err);
            }
        };

        fetchChallengeDetail();
    }, [id]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleKickUser = (username) => {
        // Xử lý logic kick user, ví dụ gọi API
        alert(`Kick user: ${username}`);
    };

    if (loading) {
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
                    <p className="text-gray-700">{error}</p>
                    <button
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
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
            {/* Header với nút quay lại và nút approve/reject dành cho admin */}
            <div className="bg-white shadow">
                <div className="container mx-auto p-4 flex justify-between items-center">
                    <button onClick={handleGoBack} className="flex items-center text-gray-700 hover:text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex space-x-4">
                        <button className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white font-medium rounded shadow">
                            Approve
                        </button>
                        <button className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded shadow">
                            Reject
                        </button>
                    </div>
                </div>
            </div>

            {/* Challenge header hiển thị tên challenge (đã link với ChallengeList) */}
            <div className="bg-white shadow">
                <div className="container mx-auto p-4 flex items-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden border border-gray-300 flex items-center justify-center">
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
            <div className="container mx-auto p-4 flex-grow">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {activeTab === 'Information' && (
                        <div className="p-6">
                            {/* Các thông tin cơ bản luôn hiển thị */}
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Thông tin cơ bản</h2>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Mô tả: </span>{challenge.description}
                            </p>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Loại: </span>{challenge.type}
                            </p>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Ngày bắt đầu: </span>{new Date(challenge.startDate).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Ngày kết thúc: </span>{new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Người tạo: </span>{challenge.creator}
                            </p>

                            {/* Hiển thị thông tin chi tiết bổ sung nếu đã duyệt */}
                            {(challenge.status === 'approved' || challenge.status === 'rejected') ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg mt-4">
                                        <div>
                                            <p className="mb-2">
                                                <span className="font-medium text-gray-700">Độ khó:</span>
                                                <span className="text-indigo-600"> {challenge.difficulty}</span>
                                            </p>
                                            <p className="mb-2">
                                                <span className="font-medium text-gray-700">Điểm số:</span>
                                                <span className="text-indigo-600"> {challenge.points}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-2">
                                                <span className="font-medium text-gray-700">Số lần nộp bài:</span>
                                                <span className="text-gray-600"> {challenge.submissionCount}</span>
                                            </p>
                                            <p className="mb-2">
                                                <span className="font-medium text-gray-700">Tỷ lệ thành công:</span>
                                                <span className="text-green-600"> {challenge.successRate}%</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Yêu cầu</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                            {challenge.requirements.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 bg-gray-50 text-gray-500 mt-4">
                                    Challenge chưa được phê duyệt. Thông tin chi tiết sẽ hiện thị sau khi được duyệt.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Tutorial' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Hướng dẫn</h2>
                            <div className="prose max-w-none text-gray-700">
                                {challenge.tutorial.type === 'text' && (
                                    <p>{challenge.tutorial.content}</p>
                                )}
                                {challenge.tutorial.type === 'image' && (
                                    <img src={challenge.tutorial.content} alt="Tutorial" className="w-full rounded" />
                                )}
                                {challenge.tutorial.type === 'video' && (
                                    <video controls className="w-full rounded">
                                        <source src={challenge.tutorial.content} type="video/mp4" />
                                        Trình duyệt của bạn không hỗ trợ video.
                                    </video>
                                )}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-medium mb-2 text-gray-800">Lưu ý quan trọng</h3>
                                    <p className="text-gray-700">
                                        Hãy đọc kỹ hướng dẫn và làm theo từng bước. Nếu gặp khó khăn, tham khảo các gợi ý được cung cấp.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Ranking' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Bảng xếp hạng</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr className="bg-gray-50">
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thứ hạng
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Người dùng
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Điểm số
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thời gian
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {challenge.ranking.map((user, index) => (
                                        <tr key={index} className={index === 0 ? "bg-yellow-50" : ""}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                                                    index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-300" : index === 2 ? "bg-yellow-700" : "bg-gray-100"
                                                } text-sm font-medium ${index < 3 ? "text-white" : "text-gray-700"}`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-indigo-600">{user.score}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{user.time}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Members' && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                Danh sách thành viên tham gia
                            </h2>
                            {/* Thanh tìm kiếm */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Tìm kiếm thành viên..."
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredMembers.map((member, index) => (
                                    <div
                                        key={index}
                                        className="bg-white shadow p-4 rounded border border-gray-200 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-gray-800 font-medium">{member.username}</p>
                                            <p className="text-gray-600 text-sm">{member.email}</p>
                                            <p className="text-gray-500 text-xs">
                                                Joined: {member.joinDate}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleKickUser(member.username)}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded"
                                        >
                                            Kick
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ChallengeDetail;
