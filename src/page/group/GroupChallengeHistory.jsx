import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaTrophy, FaUsers, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetGroupChallengeHistoryQuery } from "../../service/groupService.js"; // Adjust import path as needed

const GroupChallengeHistory = ({ groupId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0); // API uses 0-indexed pages
    const [pageSize, setPageSize] = useState(5);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch data from API
    const { data: challengeHistory, isLoading, isFetching } = useGetGroupChallengeHistoryQuery({
        groupId,
        status: statusFilter,
        page: currentPage
    });

    const challenges = challengeHistory?.content || [];
    const totalPages = challengeHistory?.totalPages || 0;
    const totalElements = challengeHistory?.totalElements || 0;

    // Filter challenges based on search term
    const filteredChallenges = challenges.filter(challenge => {
        return searchTerm === "" ||
            challenge.challengeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (challenge.description && challenge.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    // Reset to first page when status filter changes
    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter]);

    // Local search doesn't trigger refetch, just filters current results
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Status filter change triggers API refetch
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // Page change triggers API refetch
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage - 1); // Convert to 0-indexed
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "COMPLETED":
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center">
                        <FaCheckCircle className="mr-1" /> {t("challenges.status.completed")}
                    </span>
                );
            case "ONGOING":
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center">
                        <FaClock className="mr-1" /> {t("challenges.status.inProgress")}
                    </span>
                );
            case "FAILED":
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center">
                        <FaTimesCircle className="mr-1" /> {t("challenges.status.failed")}
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    // Format date to dd/mm/yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Progress indicator component based on isSuccess
    const getProgressIndicator = (isSuccess, status) => {
        if (status === "COMPLETED") {
            return isSuccess ? (
                <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <span className="text-green-600 font-medium">{t("challenges.progress.success")}</span>
                </div>
            ) : (
                <div className="flex items-center">
                    <FaTimesCircle className="text-red-500 mr-2" />
                    <span className="text-red-600 font-medium">{t("challenges.progress.failed")}</span>
                </div>
            );
        } else if (status === "ONGOING") {
            return (
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-blue-100">
                        <div className="w-1/2 shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                    <span className="text-xs text-blue-600">{t("challenges.progress.inProgress")}</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center">
                    <FaTimesCircle className="text-gray-400 mr-2" />
                    <span className="text-gray-500">{t("challenges.progress.notStarted")}</span>
                </div>
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const displayedChallenges = filteredChallenges;
    const displayedCurrentPage = currentPage + 1; // Convert to 1-indexed for display

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{t("challenges.groupHistory")}</h3>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mt-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={t("challenges.searchPlaceholder")}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="">{t("challenges.filter.allStatuses")}</option>
                            <option value="COMPLETED">{t("challenges.status.completed")}</option>
                            <option value="IN_PROGRESS">{t("challenges.status.inProgress")}</option>
                            <option value="FAILED">{t("challenges.status.failed")}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Challenge List */}
            {displayedChallenges.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.name")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.period")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.participants")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("status")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("progress")}
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {displayedChallenges.map((challenge) => (
                            <tr key={challenge.groupChallengeId || challenge.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {challenge.challengePicture ? (
                                                <img
                                                    src={challenge.challengePicture}
                                                    alt={challenge.challengeName || challenge.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                    <FaTrophy className="text-orange-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {challenge.challengeName || challenge.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {challenge.description?.substring(0, 30)}
                                                {challenge.description?.length > 30 ? "..." : ""}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <FaCalendarAlt className="mr-2 text-gray-400" />
                                        {challenge.joinDate ? (
                                            formatDate(challenge.joinDate)
                                        ) : (
                                            <>
                                                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <FaUsers className="mr-2 text-gray-400" />
                                        {challenge.participantCount || 0}
                                        {challenge.successRate && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                ({challenge.successRate}% {t("challenges.success")})
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(challenge.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getProgressIndicator(challenge.isSuccess, challenge.status)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <FaTrophy className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p>{t("challenges.noHistory")}</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(displayedCurrentPage - 1)}
                            disabled={displayedCurrentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                displayedCurrentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {t("pagination.previous")}
                        </button>
                        <button
                            onClick={() => handlePageChange(displayedCurrentPage + 1)}
                            disabled={displayedCurrentPage === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                displayedCurrentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {t("pagination.next")}
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                {t("pagination.showing")} <span className="font-medium">{Math.min(1, totalElements)}</span>{" "}
                                {t("pagination.to")}{" "}
                                <span className="font-medium">
                                    {Math.min(pageSize, totalElements)}
                                </span>{" "}
                                {t("pagination.of")} <span className="font-medium">{totalElements}</span>{" "}
                                {t("pagination.results")}
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={displayedCurrentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                        displayedCurrentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.first")}</span>
                                    <span>&laquo;</span>
                                </button>
                                <button
                                    onClick={() => handlePageChange(displayedCurrentPage - 1)}
                                    disabled={displayedCurrentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        displayedCurrentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.previous")}</span>
                                    <span>&lsaquo;</span>
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = index + 1;
                                    } else if (displayedCurrentPage <= 3) {
                                        pageNumber = index + 1;
                                    } else if (displayedCurrentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + index;
                                    } else {
                                        pageNumber = displayedCurrentPage - 2 + index;
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                displayedCurrentPage === pageNumber
                                                    ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(displayedCurrentPage + 1)}
                                    disabled={displayedCurrentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        displayedCurrentPage === totalPages
                                            ? "text-gray-300"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.next")}</span>
                                    <span>&rsaquo;</span>
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={displayedCurrentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                        displayedCurrentPage === totalPages
                                            ? "text-gray-300"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.last")}</span>
                                    <span>&raquo;</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupChallengeHistory;