import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import {  CheckCircle, XCircle } from "lucide-react";
import Sidebar from "../navbar/AdminNavbar.jsx";
import {
    useGetChallengesQuery,
    useUpdateChallengeMutation
} from "../../service/challengeService"; // Adjust path as needed

const ChallengeList = () => {
    // State management
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // RTK Query hooks
    const {
        data: challenges = [],
        isLoading,
        isError
    } = useGetChallengesQuery();
    const [updateChallenge] = useUpdateChallengeMutation();

    const navigate = useNavigate();
    const itemsPerPage = 10;

    // Filter and sort challenges
    const filteredChallenges = challenges.filter((challenge) => {
        const matchesSearch = challenge.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus ? challenge.status === filterStatus : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastChallenge = currentPage * itemsPerPage;
    const indexOfFirstChallenge = indexOfLastChallenge - itemsPerPage;
    const currentChallenges = filteredChallenges.slice(
        indexOfFirstChallenge,
        indexOfLastChallenge
    );
    const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);

    // Navigation to challenge detail page
    const navigateToChallengeDetail = (challenge) => {
        navigate(`/challenge/${challenge.id}`);
    };

    // Status and action handlers
    const toggleChallengeStatus = async (challengeId, currentStatus) => {
        const newStatus = currentStatus === "accepted" ? "rejected" : "accepted";
        try {
            await updateChallenge({
                id: challengeId,
                status: newStatus
            }).unwrap();
        } catch (error) {
            console.error("Error updating challenge status:", error);
        }
    };

    const handleAction = async (challengeId, action) => {
        try {
            const status = action === "confirmed" ? "accepted" : "rejected";
            await updateChallenge({
                id: challengeId,
                status
            }).unwrap();
        } catch (error) {
            console.error(`Error ${action} challenge:`, error);
        }
    };

    // Dropdown and filter handlers
    const toggleStatusDropdown = () => {
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
    };

    const handleStatusFilter = (status) => {
        setFilterStatus(status);
        setIsStatusDropdownOpen(false);
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
                        {/* Rest of the component remains the same as in the original code */}
                        {/* ... (previous search and filter section) ... */}

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
                                    {/* Table header and body remain the same */}
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
                                                {/* Challenge row content remains the same */}
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
                                                {/* Other columns remain the same */}
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

                        {/* Pagination section remains the same */}
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
                            {/* Pagination buttons */}
                            <div className="flex space-x-2 self-center md:self-auto">
                                {/* Previous page button */}
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
                                {/* Page indicator */}
                                <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                                    <span className="text-orange-600 font-medium">
                                        {currentPage}
                                    </span>
                                    <span className="mx-1 text-gray-400">/</span>
                                    <span className="text-gray-600">{totalPages}</span>
                                </div>
                                {/* Next page button */}
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