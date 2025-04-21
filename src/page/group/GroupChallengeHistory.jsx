import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaTrophy, FaUsers, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Mock data for challenges
const mockChallenges = [
    {
        id: "ch-001",
        name: "30 Days of Exercise",
        description: "Complete a daily exercise routine for 30 consecutive days",
        startDate: "2025-03-01T00:00:00.000Z",
        endDate: "2025-03-31T23:59:59.999Z",
        status: "COMPLETED",
        participantCount: 15,
        successRate: 78
    },
    {
        id: "ch-002",
        name: "Water Drinking Challenge",
        description: "Drink 2 liters of water every day for 2 weeks",
        startDate: "2025-03-15T00:00:00.000Z",
        endDate: "2025-03-29T23:59:59.999Z",
        status: "COMPLETED",
        participantCount: 23,
        successRate: 91
    },
    {
        id: "ch-003",
        name: "Meditation Marathon",
        description: "Meditate for at least 10 minutes daily for a month",
        startDate: "2025-04-01T00:00:00.000Z",
        endDate: "2025-04-30T23:59:59.999Z",
        status: "IN_PROGRESS",
        participantCount: 18,
        successRate: 65
    },
    {
        id: "ch-004",
        name: "No Sugar Week",
        description: "Avoid all added sugars for one full week",
        startDate: "2025-02-15T00:00:00.000Z",
        endDate: "2025-02-22T23:59:59.999Z",
        status: "COMPLETED",
        participantCount: 12,
        successRate: 42
    },
    {
        id: "ch-005",
        name: "5K Preparation",
        description: "Training program to prepare for a 5K run",
        startDate: "2025-02-01T00:00:00.000Z",
        endDate: "2025-03-15T23:59:59.999Z",
        status: "FAILED",
        participantCount: 8,
        successRate: 25
    },
    {
        id: "ch-006",
        name: "Daily Reading",
        description: "Read at least 20 pages every day for a month",
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-01-31T23:59:59.999Z",
        status: "COMPLETED",
        participantCount: 17,
        successRate: 82
    },
    {
        id: "ch-007",
        name: "Healthy Cooking Challenge",
        description: "Cook a healthy homemade meal every day for two weeks",
        startDate: "2025-04-10T00:00:00.000Z",
        endDate: "2025-04-24T23:59:59.999Z",
        status: "IN_PROGRESS",
        participantCount: 14,
        successRate: 79
    }
];

const GroupChallengeHistory = ({ groupId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Simulated data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // Filter challenges based on search term and status
    const filteredChallenges = mockChallenges.filter(challenge => {
        const matchesSearch = searchTerm === "" ||
            challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            challenge.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || challenge.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Paginate the filtered challenges
    const paginatedChallenges = filteredChallenges.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm, pageSize]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "COMPLETED":
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center">
            <FaCheckCircle className="mr-1" /> {t("challenges.status.completed", "Completed")}
          </span>
                );
            case "IN_PROGRESS":
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center">
            <FaClock className="mr-1" /> {t("challenges.status.inProgress", "In Progress")}
          </span>
                );
            case "FAILED":
                return (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center">
            <FaTimesCircle className="mr-1" /> {t("challenges.status.failed", "Failed")}
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const totalPages = Math.ceil(filteredChallenges.length / pageSize);

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{t("challenges.groupHistory", "Group Challenge History")}</h3>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mt-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={t("challenges.searchPlaceholder", "Search challenges...")}
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
                            <option value="all">{t("challenges.filter.allStatuses", "All Statuses")}</option>
                            <option value="COMPLETED">{t("challenges.status.completed", "Completed")}</option>
                            <option value="IN_PROGRESS">{t("challenges.status.inProgress", "In Progress")}</option>
                            <option value="FAILED">{t("challenges.status.failed", "Failed")}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Challenge List */}
            {paginatedChallenges.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.name", "Challenge Name")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.period", "Period")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.participants", "Participants")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.status", "Status")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {t("challenges.actions", "Actions")}
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedChallenges.map((challenge) => (
                            <tr key={challenge.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                <FaTrophy className="text-orange-500" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {challenge.name}
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
                                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <FaUsers className="mr-2 text-gray-400" />
                                        {challenge.participantCount || 0}
                                        <span className="ml-2 text-xs text-gray-500">
                        ({challenge.successRate}% success)
                      </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(challenge.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => navigate(`/challenges/${challenge.id}`)}
                                        className="text-orange-600 hover:text-orange-900 mr-3"
                                    >
                                        {t("challenges.viewDetails", "View Details")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <FaTrophy className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p>{t("challenges.noHistory", "No challenge history found")}</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between border-t">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {t("pagination.previous", "Previous")}
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {t("pagination.next", "Next")}
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                {t("pagination.showing", "Showing")} <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{" "}
                                {t("pagination.to", "to")}{" "}
                                <span className="font-medium">
                  {Math.min(currentPage * pageSize, filteredChallenges.length)}
                </span>{" "}
                                {t("pagination.of", "of")} <span className="font-medium">{filteredChallenges.length}</span>{" "}
                                {t("pagination.results", "results")}
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.first", "First")}</span>
                                    <span>&laquo;</span>
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === 1 ? "text-gray-300" : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.previous", "Previous")}</span>
                                    <span>&lsaquo;</span>
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = index + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = index + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + index;
                                    } else {
                                        pageNumber = currentPage - 2 + index;
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === pageNumber
                                                    ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === totalPages
                                            ? "text-gray-300"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.next", "Next")}</span>
                                    <span>&rsaquo;</span>
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === totalPages
                                            ? "text-gray-300"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="sr-only">{t("pagination.last", "Last")}</span>
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