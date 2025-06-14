import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import {  useUpdateReportStatusMutation, useReviewChallengeMutation } from "../../../service/adminService.js";
import {  useGetChallengeDetailQuery,} from "../../../service/challengeService.js";
import { ArrowLeft, Check, X, Ban, AlertTriangle } from "lucide-react";

const ReportDetail = ({ reportData }) => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Use the reportData passed as props instead of fetching it
    const report = reportData;
    console.log(report);

    // Fetch challenge details if report is loaded
    const { data: challengeData, isLoading: isLoadingChallenge, isError: isChallengeError } =
        useGetChallengeDetailQuery(report?.challengeId, { skip: !report?.challengeId });
    console.log(challengeData);

    // Mutation for updating report status
    const [updateReportStatus, { isLoading: isUpdating }] = useUpdateReportStatusMutation();
    const [reviewChallenge, { isLoading: isReviewing }] = useReviewChallengeMutation();

    // Confirmation modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [banChallenge, setBanChallenge] = useState(false);

    // Show confirmation modal
    const showConfirmationModal = (action, shouldBanChallenge = false) => {
        setConfirmAction(action);
        setBanChallenge(shouldBanChallenge);
        setShowConfirmModal(true);
    };

    // Close confirmation modal
    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setBanChallenge(false);
    };

    // Handle confirm action
    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            const status = confirmAction === 'approve' ? "APPROVED" : "REJECTED";

            // If we're banning the challenge first
            if (banChallenge) {
                try {
                    await reviewChallenge({
                        challengeId: report.challengeId,
                        status: "BANNED",
                        reason: "Violation of community guidelines"
                    }).unwrap();
                    console.log("Challenge banned successfully");
                } catch (error) {
                    // Check if it's a parsing error but with a successful status
                    if (error.status === 'PARSING_ERROR' && error.originalStatus === 200) {
                        console.log("Challenge banned successfully despite parsing error");
                        // Continue with the flow since the operation was successful
                    } else {
                        console.error("Failed to ban challenge:", error);
                        alert("Failed to ban challenge");
                        closeConfirmModal();
                        return; // Exit early if banning fails
                    }
                }
            }

            // Then update report status
            try {
                await updateReportStatus({
                    reportId: reportId,
                    status: status
                }).unwrap();
                console.log(`Successfully ${confirmAction}d report ${reportId}`);

                // If we're here, both actions completed successfully
                closeConfirmModal();
                if (banChallenge) {
                    alert("Challenge has been banned and report has been approved successfully");
                }
                navigate('/admin/reports');
            } catch (error) {
                // Check if it's a parsing error but with a successful status
                if (error.status === 'PARSING_ERROR' && error.originalStatus === 200) {
                    console.log(`Successfully ${confirmAction}d report despite parsing error`);
                    closeConfirmModal();
                    if (banChallenge) {
                        alert("Challenge has been banned and report has been approved successfully");
                    }
                    navigate('/admin/reports');
                } else {
                    console.error(`Failed to ${confirmAction} report:`, error);
                    alert(`Failed to ${confirmAction} report`);
                    closeConfirmModal();
                }
            }
        } catch (generalError) {
            console.error("An error occurred:", generalError);
            closeConfirmModal();
        }
    };

    // Format date from backend data
    const formatDate = (dateValue) => {
        if (!dateValue) return "Invalid date";

        let dateObj;

        // Handle array format (old format)
        if (Array.isArray(dateValue) && dateValue.length >= 3) {
            const [year, month, day] = dateValue;
            dateObj = new Date(year, month - 1, day);
        }
        // Handle timestamp or date string
        else {
            try {
                dateObj = new Date(dateValue);
            } catch (error) {
                console.error("Error parsing date:", error);
                return "Invalid date";
            }
        }

        // Check if dateObj is a valid date
        if (isNaN(dateObj.getTime())) {
            return "Invalid date";
        }

        // Format as dd/mm/yyyy
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Return to reports list
    const goBack = () => {
        navigate('/admin/reports');
    };

    // Loading and error states - only challenge loading now
    const isLoading = !report || isLoadingChallenge;
    const isError = !report || isChallengeError;

    return (
        <div className="bg-blue-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar
                        sidebarCollapsed={sidebarCollapsed}
                        setSidebarCollapsed={setSidebarCollapsed}
                    />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-blue-100 h-full flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-yellow-50 flex justify-between items-center">
                            <div className="flex items-center">
                                <button
                                    onClick={goBack}
                                    className="mr-4 p-2 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h1 className="text-2xl font-bold text-blue-700">Report Details Of {report.challengeName}</h1>
                            </div>

                            {report && report.status === "PENDING" && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => showConfirmationModal('reject')}
                                        className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                                        disabled={isUpdating || isReviewing}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <X size={16} />
                                            <span>Reject</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => showConfirmationModal('approve')}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                                        disabled={isUpdating || isReviewing}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Check size={16} />
                                            <span>Approve</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : isError ? (
                                <div className="flex justify-center items-center h-64 text-red-500">
                                    <p>An error occurred while loading data. Please try again.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Report Information */}
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-4 text-blue-700">Report Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-gray-500 text-sm">ID</p>
                                                <p className="font-medium">{report?.id}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Report Type</p>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block mt-1 ${
                                                    report?.reportType === "SPAM"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : report?.reportType === "INAPPROPRIATE_CONTENT"
                                                            ? "bg-red-100 text-red-700"
                                                            : report?.reportType === "RULE_VIOLATION"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : report?.reportType === "OFFENSIVE_BEHAVIOR"
                                                                    ? "bg-purple-100 text-purple-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                }`}>
                                                    {report?.reportType}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Status</p>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block mt-1 ${
                                                    report?.status === "PENDING"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : report?.status === "APPROVED"
                                                            ? "bg-green-100 text-green-700"
                                                            : report?.status === "REJECTED"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-gray-100 text-gray-700"
                                                }`}>
                                                    {report?.status === "PENDING"
                                                        ? "Pending"
                                                        : report?.status === "APPROVED"
                                                            ? "Approved"
                                                            : report?.status === "REJECTED"
                                                                ? "Rejected"
                                                                : report?.status}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Created Date</p>
                                                <p className="font-medium">{formatDate(report?.createdAt)}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-gray-500 text-sm">Report Content</p>
                                                <p className="mt-2 bg-white p-4 rounded border border-blue-100">{report?.content || "No content provided"}</p>
                                            </div>
                                            {report?.reporter && (
                                                <div className="md:col-span-2">
                                                    <p className="text-gray-500 text-sm">Reported By</p>
                                                    <div className="mt-2 bg-white p-4 rounded border border-blue-100">
                                                        <div className="flex items-center">
                                                            {report.reporter.avatar && (
                                                                <img
                                                                    src={report.reporter.avatar}
                                                                    alt={report.reporter.name}
                                                                    className="w-10 h-10 rounded-full mr-3"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium">{report.reporter.name}</p>
                                                                <p className="text-sm text-gray-500">{report.reporter.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Challenge Information */}
                                    {challengeData ? (
                                        <div className="bg-blue-50 p-6 rounded-lg">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-blue-700">Reported Challenge Information</h3>

                                                {report && report.status === "PENDING" && (
                                                    <button
                                                        onClick={() => showConfirmationModal('approve', true)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                                        disabled={isUpdating || isReviewing}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <Ban size={16} />
                                                            <span>Ban Challenge</span>
                                                        </div>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-gray-500 text-sm">Challenge ID</p>
                                                    <p className="font-medium">{challengeData.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Challenge Name</p>
                                                    <p className="font-medium">{challengeData.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Challenge Type</p>
                                                    <div className="mt-2">
                                                        <span className="font-medium">{challengeData.challengeType || "Unknown"}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Created Date</p>
                                                    <p className="font-medium">{formatDate(challengeData.createdAt)}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-gray-500 text-sm">Description</p>
                                                    <p className="mt-2 bg-white p-4 rounded border border-blue-100">{challengeData.description || "No description available"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Status</p>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block mt-1 ${
                                                        challengeData.challengeStatus === "ACTIVE"
                                                            ? "bg-green-100 text-green-700"
                                                            : challengeData.challengeStatus === "INACTIVE"
                                                                ? "bg-gray-100 text-gray-700"
                                                                : challengeData.challengeStatus === "REPORTED"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : challengeData.challengeStatus === "BANNED"
                                                                        ? "bg-black bg-opacity-80 text-white"
                                                                        : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                        {challengeData.challengeStatus}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Participants</p>
                                                    <p className="font-medium">{challengeData.participantsCount || 0}</p>
                                                </div>
                                                {challengeData.rules && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-gray-500 text-sm">Rules</p>
                                                        <div className="mt-2 bg-white p-4 rounded border border-blue-100">
                                                            <ul className="list-disc pl-5 space-y-1">
                                                                {challengeData.rules.map((rule, index) => (
                                                                    <li key={index}>{rule}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                                {challengeData.tags && challengeData.tags.length > 0 && (
                                                    <div className="md:col-span-2">
                                                        <p className="text-gray-500 text-sm">Tags</p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {challengeData.tags.map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        report?.challengeId && (
                                            <div className="bg-blue-50 p-6 rounded-lg">
                                                <h3 className="text-lg font-semibold mb-4 text-blue-700">Reported Challenge Information</h3>
                                                <p>Loading challenge details...</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-fadeIn">
                        <div className="flex items-center text-amber-500 mb-4">
                            <AlertTriangle className="mr-2" size={24} />
                            <h3 className="text-lg font-bold">Confirm Action</h3>
                        </div>
                        <p className="mb-6">
                            {banChallenge
                                ? "Are you sure you want to ban this challenge and approve the report? This action cannot be undone."
                                : `Are you sure you want to ${confirmAction} this report? This action cannot be undone.`
                            }
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeConfirmModal}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 rounded-md text-white ${
                                    banChallenge
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : confirmAction === 'approve'
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                } disabled:opacity-50`}
                                disabled={isUpdating || isReviewing}
                            >
                                {isUpdating || isReviewing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    banChallenge ? 'Ban Challenge' : `${confirmAction === 'approve' ? 'Approve' : 'Reject'}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportDetail;