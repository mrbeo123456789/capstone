import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Ban } from "lucide-react";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import { useGetChallengesQuery, useReviewChallengeMutation } from "../../../service/adminService.js";
import { toast } from "react-toastify"; // Import toast for notifications

const ChallengeList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Parse URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const statusFromURL = queryParams.get('status');

    // State management
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState(statusFromURL || null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionType, setActionType] = useState("");
    const [selectedChallengeId, setSelectedChallengeId] = useState(null);
    const [message, setMessage] = useState("");
    const [actionError, setActionError] = useState("");

    // Processing state to prevent double submission
    const [isProcessing, setIsProcessing] = useState(false);

    const itemsPerPage = 10;

    // Debounce search term to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sync status filter with URL
    useEffect(() => {
        if (statusFromURL) {
            setFilterStatus(statusFromURL);
        }
    }, [statusFromURL]);

    // Fetch challenges with stable dependency array
    const {
        data: challengesResponse = {},
        isLoading,
        isError,
        refetch,
    } = useGetChallengesQuery({
        page: currentPage,
        size: itemsPerPage,
        search: debouncedSearchTerm,
        status: filterStatus
    }, {
        refetchOnMountOrArgChange: true,
        skip: false
    });

    // Use review challenge mutation
    const [reviewChallenge] = useReviewChallengeMutation();

    // Compute duration between startDate and endDate (in days)
    const computeDuration = useCallback((challenge) => {
        if (!challenge.startDate || !challenge.endDate) return "";

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
    }, []);

    // Update status filter and sync URL
    const updateStatusFilter = useCallback((status) => {
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
    }, [location.pathname, location.search, navigate]);

    // Extract data from API response
    const currentChallenges = challengesResponse?.content || [];
    const totalElements = challengesResponse?.totalElements || 0;
    const totalPages = challengesResponse?.totalPages || Math.ceil(totalElements / itemsPerPage);

    // Navigate to challenge detail
    const navigateToChallengeDetail = useCallback((challenge) => {
        navigate(`/admin/challenge/${challenge.id}/detail`);
    }, [navigate]);

    // Open action modal
    const openActionModal = useCallback((challengeId, action) => {
        setSelectedChallengeId(challengeId);
        setActionType(action);
        setMessage("");
        setActionError("");
        setIsModalOpen(true);
    }, []);

    // Close modal
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedChallengeId(null);
        setActionType("");
        setMessage("");
        setActionError("");
    }, []);

    // Handle modal submit
    const handleModalSubmit = useCallback(async () => {
        if (!selectedChallengeId || !actionType || isProcessing) return;

        let newStatus;
        let successMessage;

        switch (actionType) {
            case "confirmed":
                newStatus = "APPROVED";
                successMessage = "Challenge approved successfully";
                break;
            case "rejected":
                newStatus = "REJECTED";
                successMessage = "Challenge rejected successfully";
                break;
            case "banned":
                newStatus = "BANNED";
                successMessage = "Challenge banned successfully";
                break;
            default:
                return;
        }

        setIsProcessing(true);

        try {
            setActionError("");

            const reviewRequest = {
                challengeId: selectedChallengeId,
                status: newStatus,
                adminNote: message
            };

            const response = await reviewChallenge(reviewRequest);

            // Handle success even if it comes with PARSING_ERROR due to non-JSON response
            if (response.error && response.error.status === 'PARSING_ERROR' && response.error.originalStatus === 200) {
                // This is actually a success case where the backend returned a plain text response
                closeModal();
                toast.success(successMessage);
                refetch();
            } else if (response.error) {
                // Handle actual error
                const errorMessage = response.error.data?.message || response.error.data || response.error.error || 'Unknown error occurred';
                setActionError(`Error: ${errorMessage}`);
                toast.error(`Failed to ${actionType} challenge: ${errorMessage}`);
            } else {
                // Normal success case
                closeModal();
                toast.success(successMessage);
                refetch();
            }
        } catch (error) {
            console.error(`Error ${actionType} challenge:`, error);
            setActionError(`Error: ${error.message || 'Unknown error occurred'}`);
            toast.error(`Failed to ${actionType} challenge: ${error.message || 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
        }
    }, [selectedChallengeId, actionType, message, isProcessing, reviewChallenge, closeModal, refetch]);

    // Toggle status dropdown
    const toggleStatusDropdown = useCallback(() => {
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
    }, [isStatusDropdownOpen]);

    // Handle status filter
    const handleStatusFilter = useCallback((status) => {
        updateStatusFilter(status);
    }, [updateStatusFilter]);

    // Handle search change
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    // Handle pagination
    const nextPage = useCallback(() => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    // Get status display name
    const getStatusDisplayName = useCallback((status) => {
        if (!status) return "All Status";

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
    }, []);

    // Get modal title
    const getModalTitle = useCallback(() => {
        switch (actionType) {
            case "confirmed": return "Approve Challenge";
            case "rejected": return "Reject Challenge";
            case "banned": return "Ban Challenge";
            default: return "Review Challenge";
        }
    }, [actionType]);

    // Get message placeholder
    const getMessagePlaceholder = useCallback(() => {
        switch (actionType) {
            case "confirmed": return "Enter approval message for the challenge owner...";
            case "rejected": return "Enter reason for rejection...";
            case "banned": return "Enter reason for banning this challenge...";
            default: return "Enter message for the user...";
        }
    }, [actionType]);

    return (
        <div className="bg-blue-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-blue-100 h-full flex flex-col">
                        {/* Search and Filter Section */}
                        <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-yellow-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Searching challenge ..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={toggleStatusDropdown}
                                        className="px-4 py-2 border border-blue-200 rounded-lg bg-white flex items-center justify-between min-w-[180px]"
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
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-blue-200 rounded-lg shadow-lg z-10">
                                            <div className="py-1">
                                                <button onClick={() => handleStatusFilter(null)} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                    All status
                                                </button>
                                                <button onClick={() => handleStatusFilter("REJECTED")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                    Rejected
                                                </button>
                                                <button onClick={() => handleStatusFilter("PENDING")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                    Pending
                                                </button>
                                                <button onClick={() => handleStatusFilter("BANNED")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                    Banned
                                                </button>
                                                <button onClick={() => handleStatusFilter("CANCELED")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                    Canceled
                                                </button>
                                                <button onClick={() => handleStatusFilter("FINISH")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                    Finished
                                                </button>
                                                <button onClick={() => handleStatusFilter("ONGOING")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                    Ongoing
                                                </button>
                                                <button onClick={() => handleStatusFilter("UPCOMING")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
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
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : isError ? (
                                <div className="flex justify-center items-center h-64 text-red-500">
                                    <p>Error to get data. Please try again</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-50 to-yellow-50 text-blue-700">
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
                                                Not have any challenge yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentChallenges.map((challenge) => (
                                            <tr key={challenge.id} className="border-b border-blue-50 hover:bg-blue-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <span
                                                            className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
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
                                                        challenge.status.toUpperCase() === "UPCOMING"
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
                                                                            onClick={() => openActionModal(challenge.id, "confirmed")}
                                                                            title="Approve Challenge"
                                                                        >
                                                                            <CheckCircle className="h-5 w-5" />
                                                                        </button>
                                                                        <button
                                                                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                                            onClick={() => openActionModal(challenge.id, "rejected")}
                                                                            title="Reject Challenge"
                                                                        >
                                                                            <XCircle className="h-5 w-5" />
                                                                        </button>
                                                                    </>
                                                                );
                                                            } else if (status === "REJECTED") {
                                                                return (
                                                                    <button
                                                                        className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                                        onClick={() => openActionModal(challenge.id, "confirmed")}
                                                                        title="Approve Challenge"
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
                                                                        onClick={() => openActionModal(challenge.id, "banned")}
                                                                        title="Ban Challenge"
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

                        {/* Pagination Controls */}
                        <div className="bg-gradient-to-r from-blue-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-blue-100 gap-4">
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
                                    className="p-2 rounded-md bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={prevPage}
                                    disabled={currentPage === 0}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="bg-white border border-blue-200 rounded-md px-4 py-2 flex items-center">
                                    <span className="text-blue-600 font-medium">{currentPage + 1}</span>
                                    <span className="mx-1 text-gray-400">/</span>
                                    <span className="text-gray-600">{totalPages}</span>
                                </div>
                                <button
                                    className="p-2 rounded-md bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={nextPage}
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

            {/* Modal Component */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-blue-100">
                            <h3 className="text-lg font-semibold text-blue-700">{getModalTitle()}</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message to User
                                </label>
                                <textarea
                                    id="message"
                                    rows="4"
                                    className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    placeholder={getMessagePlaceholder()}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>
                            {actionError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {actionError}
                                </div>
                            )}
                            <p className="text-sm text-gray-500 mb-4">
                                {actionType === "confirmed" && "This message will be sent to the user when the challenge is approved."}
                                {actionType === "rejected" && "This message will explain to the user why their challenge was rejected."}
                                {actionType === "banned" && "This message will inform the user that their challenge has been banned."}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                onClick={closeModal}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md text-white ${
                                    actionType === "confirmed"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : actionType === "rejected" || actionType === "banned"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-blue-600 hover:bg-blue-700"
                                } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={handleModalSubmit}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    actionType === "confirmed" ? "Approve" : actionType === "rejected" ? "Reject" : actionType === "banned" ? "Ban" : "Submit"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengeList;