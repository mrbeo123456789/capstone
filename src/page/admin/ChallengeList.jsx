import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Ban } from "lucide-react";
import Sidebar from "../navbar/AdminNavbar.jsx";
import { useGetChallengesQuery } from "../../service/adminService.js";

const ChallengeList = () => {
    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 10;

    // RTK Query hook: lấy dữ liệu theo phân trang từ backend
    const {
        data: challengesResponse = {},
        isLoading,
        isError,
    } = useGetChallengesQuery({ page: currentPage - 1, size: itemsPerPage });

    // Giả định API trả về dữ liệu có property "content"
    const allChallenges = challengesResponse?.content || [];

    // Hàm tính duration = endDate - startDate (tính theo ngày)
    const computeDuration = (challenge) => {
        if (challenge.startDate && challenge.endDate) {
            let s = challenge.startDate;
            let e = challenge.endDate;
            // Nếu dữ liệu trả về là array [year, month, day]
            if (Array.isArray(s) && Array.isArray(e)) {
                const start = new Date(s[0], s[1] - 1, s[2]);
                const end = new Date(e[0], e[1] - 1, e[2]);
                const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
                return diff + " days";
            }
            // Nếu là chuỗi, parse trực tiếp
            const start = new Date(s);
            const end = new Date(e);
            const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
            return diff + " days";
        }
        return "";
    };

    // Lọc theo searchTerm và filterStatus (client-side)
    const filteredChallenges = allChallenges.filter((challenge) => {
        const matchesSearch = challenge.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus ? challenge.status === filterStatus : true;
        return matchesSearch && matchesStatus;
    });

    // Sắp xếp theo id tăng dần
    const sortedChallenges = [...filteredChallenges].sort((a, b) => a.id - b.id);

    // Client-side pagination
    const indexOfLastChallenge = currentPage * itemsPerPage;
    const indexOfFirstChallenge = indexOfLastChallenge - itemsPerPage;
    const currentChallenges = sortedChallenges;
    const totalPages = challengesResponse?.totalPages || Math.ceil(sortedChallenges.length / itemsPerPage);

    // Navigation tới chi tiết thử thách
    const navigateToChallengeDetail = (challenge) => {
        navigate(`/challenge/${challenge.id}`);
    };

    // Hành động cho challenge:
    // Nếu status là PENDING: hiển thị nút Approve và Reject.
    // Nếu status là REJECTED: chỉ hiển thị nút Approve.
    // Với các trạng thái khác: giữ nguyên nút toggle theo logic cũ.
    const handleAction = async (challengeId, action) => {
        try {
            const newStatus = action === "confirmed" ? "APPROVED" : "REJECTED";
            console.log(`Would change status for challenge ${challengeId} to ${newStatus}`);
            // TODO: Gọi API cập nhật trạng thái nếu cần
        } catch (error) {
            console.error(`Error ${action} challenge:`, error);
        }
    };

    const toggleChallengeStatus = async (challengeId, currentStatus) => {
        const newStatus = currentStatus.toUpperCase() === "APPROVED" ? "REJECTED" : "APPROVED";
        try {
            console.log(`Would toggle status for challenge ${challengeId} to ${newStatus}`);
            // TODO: Gọi API cập nhật trạng thái nếu cần
        } catch (error) {
            console.error("Error updating challenge status:", error);
        }
    };

    // Hành động ban cho các challenge nếu cần (có thể bổ sung tùy ý)
    const banChallenge = async (challengeId) => {
        try {
            console.log(`Would ban challenge ${challengeId}`);
            // TODO: Gọi API cập nhật trạng thái thành BANNED nếu cần
        } catch (error) {
            console.error("Error banning challenge:", error);
        }
    };

    // Dropdown handlers
    const toggleStatusDropdown = () => {
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
    };

    const handleStatusFilter = (status) => {
        setFilterStatus(status);
        setIsStatusDropdownOpen(false);
        setCurrentPage(1);
    };

    // Search input handler
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Pagination handlers
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="bg-red-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar
                        sidebarCollapsed={sidebarCollapsed}
                        setSidebarCollapsed={setSidebarCollapsed}
                    />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                        {/* Search and Filter Section */}
                        <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm thử thách..."
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
                    <span>
                      {filterStatus === "APPROVED"
                          ? "Đã duyệt"
                          : filterStatus === "REJECTED"
                              ? "Đã từ chối"
                              : filterStatus === "PENDING"
                                  ? "Đang chờ"
                                  : filterStatus === "BANNED"
                                    ? "Bị ban"
                                    : filterStatus === "CANCELLED"
                                        ? "Bị hủy"
                                        : filterStatus === "FINISH"
                                            ? "Đã kết thúc"
                                            : filterStatus === "ONGOING"
                                                ? "Đang diễn ra"
                                                : filterStatus === "UPCOMING"
                                                    ? "Sắp diễn ra"
                                                    : "Tất cả trạng thái"}
                    </span>
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
                                                    Tất cả trạng thái
                                                </button>
                                                <button onClick={() => handleStatusFilter("APPROVED")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Đã duyệt
                                                </button>
                                                <button onClick={() => handleStatusFilter("REJECTED")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Đã từ chối
                                                </button>
                                                <button onClick={() => handleStatusFilter("PENDING")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Đang chờ
                                                </button>
                                                <button onClick={() => handleStatusFilter("BANNED")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Đã ban
                                                </button>
                                                <button onClick={() => handleStatusFilter("CANCELED")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Bị hủy
                                                </button>
                                                <button onClick={() => handleStatusFilter("FINISH")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Đã kết thúc
                                                </button><button onClick={() => handleStatusFilter("ONGOING")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Đang diễn ra
                                                </button>
                                                <button onClick={() => handleStatusFilter("UPCOMING")} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                    Sắp diễn ra
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
                                    <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-700">
                                    <tr>
                                        <th className="p-4 text-left">Thử thách</th>
                                        <th className="p-4 text-left">Duration</th>
                                        <th className="p-4 text-left">Trạng thái</th>
                                        <th className="p-4 text-center">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentChallenges.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-4 text-center text-gray-500">
                                                Không có thử thách nào phù hợp với tìm kiếm của bạn.
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
                            <span className="font-medium">
                              {computeDuration(challenge)}
                            </span>
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
                                                                // Hiển thị 2 nút: Approve và Reject
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
                                                            } else if (status === "APPROVED") {
                                                                // Nếu đã approve, chỉ cho phép chuyển sang rejected
                                                                return (
                                                                    <button
                                                                        className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                                        onClick={() => handleAction(challenge.id, "rejected")}
                                                                    >
                                                                        <XCircle className="h-5 w-5" />
                                                                    </button>
                                                                );
                                                            } else if (status === "REJECTED") {
                                                                // Nếu đã reject, chỉ cho phép chuyển sang approved
                                                                return (
                                                                    <button
                                                                        className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                                        onClick={() => handleAction(challenge.id, "confirmed")}
                                                                    >
                                                                        <CheckCircle className="h-5 w-5" />
                                                                    </button>
                                                                );
                                                            } else if (status === "BANNED" || status === "FINISH" || status === "CANCELED") {
                                                                // Không hiển thị action nếu status là BANNED hoặc FINISH
                                                                return null;
                                                            } else {
                                                                // Các trạng thái khác sẽ có nút ban
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

                        {/* Pagination Section */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-orange-100 gap-4">
                            <div className="text-gray-600">
                                Hiển thị{" "}
                                <span className="font-medium">
                  {currentChallenges.length > 0 ? indexOfFirstChallenge + 1 : 0}
                </span>{" "}
                                đến{" "}
                                <span className="font-medium">
                  {indexOfFirstChallenge + currentChallenges.length}
                </span>{" "}
                                trong tổng số{" "}
                                <span className="font-medium">{sortedChallenges.length}</span> thử thách
                            </div>
                            <div className="flex space-x-2 self-center md:self-auto">
                                <button
                                    className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                                    <span className="text-orange-600 font-medium">{currentPage}</span>
                                    <span className="mx-1 text-gray-400">/</span>
                                    <span className="text-gray-600">{totalPages || 1}</span>
                                </div>
                                <button
                                    className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
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
