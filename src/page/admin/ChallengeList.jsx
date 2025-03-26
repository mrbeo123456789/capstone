import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import Sidebar from "../navbar/AdminNavbar.jsx";

const ChallengeList = () => {
    // State management
    const [challenges, setChallenges] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 10;

    // Fetch challenges data
    useEffect(() => {
        // Replace with your actual data fetching logic
        const fetchChallenges = async () => {
            try {
                setIsLoading(true);
                // Mock API call - replace with actual API call
                const response = await fetch("/api/challenges");
                const data = await response.json();
                setChallenges(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching challenges:", error);
                setIsError(true);
                setIsLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    // Filter and sort challenges
    const filteredChallenges = challenges.filter((challenge) => {
        const matchesSearch = challenge.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus ? challenge.status === filterStatus : true;
        return matchesSearch && matchesStatus;
    });

    const sortedChallenges = [...filteredChallenges].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        } else if (sortField === "status") {
            return sortDirection === "asc"
                ? a.status.localeCompare(b.status)
                : b.status.localeCompare(a.status);
        }
        return 0;
    });

    // Pagination
    const indexOfLastChallenge = currentPage * itemsPerPage;
    const indexOfFirstChallenge = indexOfLastChallenge - itemsPerPage;
    const currentChallenges = sortedChallenges.slice(
        indexOfFirstChallenge,
        indexOfLastChallenge
    );
    const totalPages = Math.ceil(sortedChallenges.length / itemsPerPage);

    // Navigation to challenge detail page
    const navigateToChallengeDetail = (challenge) => {
        navigate(`/challenge/${challenge.id}`);
    };

    // Sort, filter and pagination handlers
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const toggleStatusDropdown = () => {
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
    };

    const handleStatusFilter = (status) => {
        setFilterStatus(status);
        setIsStatusDropdownOpen(false);
        setCurrentPage(1);
    };

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

    // Challenge action handlers
    const handleAction = async (challengeId, action) => {
        try {
            // Replace with your actual API call
            await fetch(`/api/challenges/${challengeId}/${action}`, {
                method: "POST",
            });

            // Update the UI after action
            setChallenges(
                challenges.map((challenge) =>
                    challenge.id === challengeId
                        ? {
                            ...challenge,
                            status: action === "confirmed" ? "accepted" : "rejected",
                        }
                        : challenge
                )
            );
        } catch (error) {
            console.error(`Error ${action} challenge:`, error);
        }
    };

    const toggleChallengeStatus = async (challengeId, currentStatus) => {
        const newStatus = currentStatus === "accepted" ? "rejected" : "accepted";
        try {
            // Replace with your actual API call
            await fetch(`/api/challenges/${challengeId}/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            // Update the UI after status change
            setChallenges(
                challenges.map((challenge) =>
                    challenge.id === challengeId
                        ? { ...challenge, status: newStatus }
                        : challenge
                )
            );
        } catch (error) {
            console.error("Error updating challenge status:", error);
        }
    };

    return (
        <div className="bg-red-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300  ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
            <div className="flex-1 overflow-auto p-4">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                    <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                        <h1 className="text-2xl font-bold text-orange-600 mb-4">
                            Quản lý thử thách
                        </h1>
                        <div className="flex flex-col md:flex-row gap-3 justify-between">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên hoặc email..."
                                    className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                                    <Search className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={toggleStatusDropdown}
                                    className="flex items-center space-x-2 bg-white border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                  <span>
                    {filterStatus
                        ? `Trạng thái: ${filterStatus}`
                        : "Lọc theo trạng thái"}
                  </span>
                                    <ChevronDown className="h-5 w-5 text-orange-500" />
                                </button>
                                {isStatusDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-orange-100">
                                        <div className="py-1">
                                            <button
                                                onClick={() => handleStatusFilter(null)}
                                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                            >
                                                Tất cả
                                            </button>
                                            <button
                                                onClick={() => handleStatusFilter("accepted")}
                                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                            >
                                                Đã chấp nhận
                                            </button>
                                            <button
                                                onClick={() => handleStatusFilter("waiting")}
                                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                            >
                                                Đang chờ
                                            </button>
                                            <button
                                                onClick={() => handleStatusFilter("rejected")}
                                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                            >
                                                Đã từ chối
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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
                                <thead className="bg-gradient-to-r from-orange-100 to-yellow-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-left font-bold text-orange-800">
                                        <button
                                            className="flex items-center"
                                            onClick={() => handleSort("name")}
                                        >
                                            Tên thử thách
                                            {sortField === "name" && (
                                                <span className="ml-1 text-orange-500">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-4 text-left font-bold text-orange-800 hidden md:table-cell">
                                        Mô tả
                                    </th>
                                    <th className="p-4 text-left font-bold text-orange-800">
                                        <button
                                            className="flex items-center"
                                            onClick={() => handleSort("status")}
                                        >
                                            Trạng thái
                                            {sortField === "status" && (
                                                <span className="ml-1 text-orange-500">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-4 text-left font-bold text-orange-800">
                                        Thao tác
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentChallenges.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="p-4 text-center text-gray-500"
                                        >
                                            Không có thử thách nào phù hợp với tìm kiếm của bạn.
                                        </td>
                                    </tr>
                                ) : (
                                    currentChallenges.map((challenge) => (
                                        <tr
                                            key={challenge.id}
                                            className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                                                        <img
                                                            src={challenge.thumbnail}
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
                                            <td className="p-4 hidden md:table-cell text-gray-600">
                                                {challenge.description}
                                            </td>
                                            <td className="p-4">
                                                {challenge.status === "rejected" ||
                                                challenge.status === "inactive" ? (
                                                    <div className="flex items-center text-red-500">
                                                        <XCircle className="mr-2 h-5 w-5" />
                                                        <span className="text-sm font-medium">
                                {challenge.status === "rejected"
                                    ? "Đã từ chối"
                                    : "Không hoạt động"}
                              </span>
                                                    </div>
                                                ) : challenge.status === "waiting" ? (
                                                    <div className="flex items-center text-yellow-500">
                                                        <span className="mr-2 h-5 w-5">⏳</span>
                                                        <span className="text-sm font-medium">
                                Đang chờ
                              </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-green-500">
                                                        <CheckCircle className="mr-2 h-5 w-5" />
                                                        <span className="text-sm font-medium">
                                {challenge.status === "accepted"
                                    ? "Đã chấp nhận"
                                    : "Hoạt động"}
                              </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    {challenge.status === "waiting" ? (
                                                        <>
                                                            <button
                                                                className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                                onClick={() =>
                                                                    handleAction(challenge.id, "confirmed")
                                                                }
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                                onClick={() =>
                                                                    handleAction(challenge.id, "rejected")
                                                                }
                                                            >
                                                                <XCircle className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className={`p-2 ${
                                                                challenge.status === "accepted"
                                                                    ? "bg-red-100 text-red-600"
                                                                    : "bg-green-100 text-green-600"
                                                            } rounded-md hover:${
                                                                challenge.status === "accepted"
                                                                    ? "bg-red-200"
                                                                    : "bg-green-200"
                                                            } transition-colors`}
                                                            onClick={() =>
                                                                toggleChallengeStatus(
                                                                    challenge.id,
                                                                    challenge.status
                                                                )
                                                            }
                                                        >
                                                            {challenge.status === "accepted" ? (
                                                                <XCircle className="h-5 w-5" />
                                                            ) : (
                                                                <CheckCircle className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        )}
                    </div>
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
                            <span className="font-medium">{challenges.length}</span> thử thách
                        </div>
                        <div className="flex space-x-2 self-center md:self-auto">
                            <button
                                className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                            <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                <span className="text-orange-600 font-medium">
                  {currentPage}
                </span>
                                <span className="mx-1 text-gray-400">/</span>
                                <span className="text-gray-600">{totalPages}</span>
                            </div>
                            <button
                                className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
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