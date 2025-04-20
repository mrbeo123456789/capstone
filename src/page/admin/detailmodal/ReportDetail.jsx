import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import {  useUpdateReportStatusMutation } from "../../../service/adminService.js";
import {  useGetChallengeDetailQuery,} from "../../../service/challengeService.js";
import { ArrowLeft, Check, X } from "lucide-react";

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
    console.log(challengeData)
    // Mutation for updating report status
    const [updateReportStatus, { isLoading: isUpdating }] = useUpdateReportStatusMutation();

    // Handle approve report
    const handleApprove = async () => {
        try {
            await updateReportStatus({
                reportId: reportId,
                status: "APPROVED"
            }).unwrap();
            // Navigate back or show success message
            navigate('/admin/reports');
        } catch (error) {
            console.error("Failed to approve report:", error);
        }
    };

    // Handle reject report
    const handleReject = async () => {
        try {
            await updateReportStatus({
                reportId: reportId,
                status: "REJECTED"
            }).unwrap();
            // Navigate back or show success message
            navigate('/admin/reports');
        } catch (error) {
            console.error("Failed to reject report:", error);
        }
    };

    // Format date from backend (array format)
    const formatBackendDateArray = (dateArray) => {
        if (!Array.isArray(dateArray) || dateArray.length < 3) return "Invalid date";
        const [year, month, day] = dateArray;
        const dd = day < 10 ? `0${day}` : day;
        const mm = month < 10 ? `0${month}` : month;
        return `${dd}/${mm}/${year}`;
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
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                                        disabled={isUpdating}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <X size={16} />
                                            <span>Reject</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                                        disabled={isUpdating}
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
                                                <p className="font-medium">{formatBackendDateArray(report?.createdAt)}</p>
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
                                            <h3 className="text-lg font-semibold mb-4 text-blue-700">Reported Challenge Information</h3>
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
                                                    <p className="text-gray-500 text-sm">Created By</p>
                                                    <div className="mt-2 flex items-center">
                                                        {challengeData.creator?.avatar && (
                                                            <img
                                                                src={challengeData.creator.avatar}
                                                                alt={challengeData.creator.name}
                                                                className="w-8 h-8 rounded-full mr-2"
                                                            />
                                                        )}
                                                        <span className="font-medium">{challengeData.creator?.name || "Unknown"}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Created Date</p>
                                                    <p className="font-medium">{formatBackendDateArray(challengeData.createdAt)}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-gray-500 text-sm">Description</p>
                                                    <p className="mt-2 bg-white p-4 rounded border border-blue-100">{challengeData.description || "No description available"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm">Status</p>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block mt-1 ${
                                                        challengeData.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-700"
                                                            : challengeData.status === "INACTIVE"
                                                                ? "bg-gray-100 text-gray-700"
                                                                : challengeData.status === "REPORTED"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                        {challengeData.status}
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
        </div>
    );
};

export default ReportDetail;