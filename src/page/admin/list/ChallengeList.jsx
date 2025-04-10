import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Ban } from "lucide-react";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import { useGetChallengesQuery, useReviewChallengeMutation } from "../../../service/adminService.js";

const ChallengeList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Parse URL query parameters
    // Parse URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const statusFromURL = queryParams.get('status');

// State management
// Chuyển currentPage sang 0-indexed giống UserList
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(statusFromURL);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const itemsPerPage = 10;

// Effect để đồng bộ status filter theo URL
    useEffect(() => {
        if (statusFromURL) {
            setFilterStatus(statusFromURL);
        }
    }, [statusFromURL]);

// Gọi API phân trang (API đang nhận page ở dạng 0-indexed)
    const {
        data: challengesResponse = {},
        isLoading,
        isError,
        refetch,
    } = useGetChallengesQuery({ page: currentPage, size: itemsPerPage, search: searchTerm, status: filterStatus });

// Sử dụng mutation reviewChallenge
    const [reviewChallenge] = useReviewChallengeMutation();

// Giả định API trả về dữ liệu có property "content"
    const allChallenges = challengesResponse?.content || [];

// Hàm tính duration giữa startDate và endDate (tính theo ngày)
    const computeDuration = (challenge) => {
        if (challenge.startDate && challenge.endDate) {
            let s = challenge.startDate;
            let e = challenge.endDate;
            if (Array.isArray(s) && Array.isArray(e)) {
                const start = new Date(s[0], s[1] - 1, s[2]);
                const end = new Date(e[0], e[1] - 1, e[2]);
                const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
                return diff + " days";
            }
            const start = new Date(s);
            const end = new Date(e);
            const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
            return diff + " days";
        }
        return "";
    };

// Cập nhật filter status và đồng bộ URL
    const updateStatusFilter = (status) => {
        setFilterStatus(status);
        setIsStatusDropdownOpen(false);
        setCurrentPage(0);
        const newParams = new URLSearchParams(location.search);
        if (status) {
            newParams.set('status', status);
        } else {
            newParams.delete('status');
        }
        navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    };

// Phân trang theo dữ liệu trả về từ API
// currentChallenges chính là kết quả phân trang từ API
    const currentChallenges = challengesResponse?.content || [];
    const totalElements = challengesResponse?.totalElements || 0;
    const totalPages = challengesResponse?.totalPages || Math.ceil(totalElements / itemsPerPage);

// Navigation tới trang chi tiết của challenge
    const navigateToChallengeDetail = (challenge) => {
        navigate(`/admin/challenge/${challenge.id}/detail`);
    };

// Hàm xử lý review (Approve/Reject)
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

// Hàm xử lý ban challenge (chuyển sang status BANNED)
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

// Xử lý dropdown status
    const toggleStatusDropdown = () => {
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
    };

    const handleStatusFilter = (status) => {
        updateStatusFilter(status);
    };

// Xử lý thay đổi của ô search
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

// Pagination handlers (giống như UserList)
    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

// Hàm chuyển đổi tên hiển thị status
    const getStatusDisplayName = (status) => {
        if (!status) return "All Status";

        // Map from pie chart names to dropdown names if needed
        switch (status.toUpperCase()) {
            case "ONGOING": return "ONGOING";
            case "PENDING": return "PENDING";
            case "FAILED": return "FAILED";
            case "REJECTED": return "REJECTED";
            case "BANNED": return "BANNED";
            case "CANCELED": return "CANCELED";
            case "FINISH": return "FINISH";
            case "UPCOMING": return "UPCOMING";
            default: return status;
        }
    };

    return (
        <div className="bg-red-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                        {/* Search and Filter Section */}
                        <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Searching challenge ..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={toggleStatusDropdown}
                                        className="px-4 py-2 border border-orange-200 rounded-lg bg-white flex items-center justify-between min-w-[180px]"
                                    >
                                        <span>{getStatusDisplayName(filterStatus)}</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-5 w-5 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isStatusDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-orange-200 rounded-lg shadow-lg z-10">
                                            <div className="py-1">
                                                <button onClick={() => handleStatusFilter(null)} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    All status
                                                </button>
                                                <button onClick={() => handleStatusFilter("REJECTED")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Rejected
                                                </button>
                                                <button onClick={() => handleStatusFilter("PENDING")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Pending
                                                </button>
                                                <button onClick={() => handleStatusFilter("BANNED")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Banned
                                                </button>
                                                <button onClick={() => handleStatusFilter("CANCELED")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Canceled
                                                </button>
                                                <button onClick={() => handleStatusFilter("FINISH")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Finished
                                                </button>
                                                <button onClick={() => handleStatusFilter("ONGOING")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    On going
                                                </button>
                                                <button onClick={() => handleStatusFilter("UPCOMING")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Upcoming
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="flex-1 overflow-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                </div>
                            ) : isError ? (
                                <div className="flex justify-center items-center h-64 text-red-500">
                                    <p>Error to get data. Please try again</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700">
                                    <tr>
                                        <th className="p-4 text-left">Challenge</th>
                                        <th className="p-4 text-left">Duration</th>
                                        <th className="p-4 text-left">Status</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentChallenges.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-4 text-center text-gray-500">
                                                Không có challenge nào
                                            </td>
                                        </tr>
                                    ) : (
                                        currentChallenges.map((challenge) => (
                                            <tr key={challenge.id} className="border-b border-orange-50 hover:bg-orange-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                                                            <img
                                                                src={challenge.picture}
                                                                alt={challenge.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span
                                                            className="font-medium text-orange-600 hover:text-orange-800 cursor-pointer hover:underline"
                                                            onClick={() => navigateToChallengeDetail(challenge)}
                                                        >
                                                            {challenge.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-medium">{computeDuration(challenge)}</span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        challenge.status.toUpperCase() === "APPROVED"
                                                            ? "bg-green-100 text-green-700"
                                                            : challenge.status.toUpperCase() === "REJECTED"
                                                                ? "bg-red-100 text-red-700"
                                                                : challenge.status.toUpperCase() === "BANNED" ||
                                                                challenge.status.toUpperCase() === "FINISH"
                                                                    ? "bg-gray-100 text-gray-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                        {challenge.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2 justify-center">
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
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination Controls (giống UserList) */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-orange-100 gap-4">
                            <div className="text-gray-600">
                                Display{" "}
                                <span className="font-medium">
                                {currentChallenges.length > 0 ? (currentPage * itemsPerPage) + 1 : 0}
                            </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                {(currentPage * itemsPerPage) + currentChallenges.length}
                            </span>{" "}
                                in total{" "}
                                <span className="font-medium">{totalElements}</span> challenges
                            </div>
                            <div className="flex space-x-2 self-center md:self-auto">
                                <button
                                    className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                    disabled={currentPage === 0}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                                    <span className="text-orange-600 font-medium">{currentPage + 1}</span>
                                    <span className="mx-1 text-gray-400">/</span>
                                    <span className="text-gray-600">{totalPages}</span>
                                </div>
                                <button
                                    className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ChallengeList;