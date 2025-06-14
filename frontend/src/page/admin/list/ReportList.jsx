import { useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import { ChevronLeft, ChevronRight, Check, X, ExternalLink, AlertTriangle } from "lucide-react";
import { useFilterReportsQuery, useUpdateReportStatusMutation } from "../../../service/adminService.js";
import ReportDetail from "../detailmodal/ReportDetail.jsx";

const ReportList = () => {
    // Navigation and state management
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [reportTypeFilter, setReportTypeFilter] = useState("");
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Confirmation modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [reportToUpdate, setReportToUpdate] = useState(null);

    const itemsPerPage = 10;

    // API hooks
    const { data: reportsData, isLoading, isError, refetch } = useFilterReportsQuery({
        reportType: reportTypeFilter.trim(),
        page: currentPage - 1,
        size: itemsPerPage,
    });

    // Add the mutation hook for updating report status
    const [updateReportStatus, { isLoading: isUpdating }] = useUpdateReportStatusMutation();

    // Get data from API
    const reports = reportsData?.content || [];
    const totalElements = reportsData?.totalElements || 0;
    const totalPages = reportsData?.totalPages || 1;

    // Dropdown handlers
    const toggleStatusDropdown = () => {
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
    };

    // Navigate to details page and pass report data
    const openDetailPage = (report) => {
        setSelectedReport(report);
        navigate(`/admin/reports/${report.id}/detail`);
    };

    // Filter handlers
    const handleReportTypeChange = (status) => {
        setReportTypeFilter(status);
        setIsStatusDropdownOpen(false);
        setCurrentPage(1);
    };

    // Pagination functions
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

    // Show confirmation modal
    const showConfirmationModal = (action, reportId) => {
        setReportToUpdate(reportId);
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    // Close confirmation modal
    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setReportToUpdate(null);
        setConfirmAction(null);
    };

    // Report action handlers with API integration
    const handleConfirmAction = async () => {
        if (!reportToUpdate || !confirmAction) return;

        try {
            const status = confirmAction === 'approve' ? "APPROVED" : "REJECTED";

            // Call the API but handle the response manually
            const result = await updateReportStatus({
                reportId: reportToUpdate,
                status: status
            });

            // Check if we have a successful response despite the parsing error
            if (result.error && result.error.originalStatus === 200) {
                // This is actually a successful response, but the parser couldn't handle it
                console.log(`Successfully ${confirmAction}d report ${reportToUpdate}`);

                // Close the modal and refresh the data
                closeConfirmModal();
                refetch();
            } else if (!result.error) {
                // Normal success case
                console.log(`Successfully ${confirmAction}d report ${reportToUpdate}`);

                // Close the modal and refresh the data
                closeConfirmModal();
                refetch();
            } else {
                // Real error case
                throw new Error(`Failed to ${confirmAction} report: ${JSON.stringify(result.error)}`);
            }
        } catch (error) {
            console.error(`Failed to ${confirmAction} report:`, error);
            closeConfirmModal();
            // You could add error handling/notification here
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

    // Calculate pagination info
    const indexOfFirstReport = (currentPage - 1) * itemsPerPage + 1;
    const indexOfLastReport = indexOfFirstReport + reports.length - 1;

    return (
        <Routes>
            <Route path="/" element={
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
                                {/* Search and Filter Section */}
                                <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-yellow-50">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <h1 className="text-2xl font-bold text-blue-700">Reports List</h1>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={toggleStatusDropdown}
                                                className="px-4 py-2 border border-blue-200 rounded-lg bg-white flex items-center justify-between min-w-[180px]"
                                            >
                                                <span>
                                                    {reportTypeFilter === "SPAM"
                                                        ? "SPAM"
                                                        : reportTypeFilter === "INAPPROPRIATE_CONTENT"
                                                            ? "Inappropriate Content"
                                                            : reportTypeFilter === "RULE_VIOLATION"
                                                                ? "Rule Violation"
                                                                : reportTypeFilter === "OFFENSIVE_BEHAVIOR"
                                                                    ? "Offensive Behavior"
                                                                    : reportTypeFilter === "OTHER"
                                                                        ? "Other"
                                                                        : "All Report Types"}
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
                                                <div className="absolute right-0 mt-2 w-56 bg-white border border-blue-200 rounded-lg shadow-lg z-10">
                                                    <div className="py-1">
                                                        <button onClick={() => handleReportTypeChange("")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                            All Report Types
                                                        </button>
                                                        <button onClick={() => handleReportTypeChange("SPAM")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                            SPAM
                                                        </button>
                                                        <button onClick={() => handleReportTypeChange("INAPPROPRIATE_CONTENT")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                            Inappropriate Content
                                                        </button>
                                                        <button onClick={() => handleReportTypeChange("RULE_VIOLATION")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                            Rule Violation
                                                        </button>
                                                        <button onClick={() => handleReportTypeChange("OFFENSIVE_BEHAVIOR")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                            Offensive Behavior
                                                        </button>
                                                        <button onClick={() => handleReportTypeChange("OTHER")} className="block w-full text-left px-4 py-2 hover:bg-blue-50">
                                                            Other
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
                                            <p>An error occurred while loading data. Please try again.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-blue-50 to-yellow-50 text-blue-700">
                                            <tr>
                                                <th className="p-4 text-left">ID</th>
                                                <th className="p-4 text-left">Report Type</th>
                                                <th className="p-4 text-left">Challenge</th>
                                                <th className="p-4 text-left">Created Date</th>
                                                <th className="p-4 text-left">Status</th>
                                                <th className="p-4 text-center">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {reports.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="p-4 text-center text-gray-500">
                                                        No reports match your search criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                reports.map((report) => (
                                                    <tr
                                                        key={report.id}
                                                        className="border-b border-blue-50 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <td className="p-4">{report.id}</td>
                                                        <td className="p-4">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                report.reportType === "SPAM"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : report.reportType === "INAPPROPRIATE_CONTENT"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : report.reportType === "RULE_VIOLATION"
                                                                            ? "bg-blue-100 text-blue-700"
                                                                            : report.reportType === "OFFENSIVE_BEHAVIOR"
                                                                                ? "bg-purple-100 text-purple-700"
                                                                                : "bg-gray-100 text-gray-700"
                                                            }`}>
                                                                {report.reportType}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">{report.challengeName || "-"}</td>
                                                        <td className="p-4">
                                                            {formatDate(report.createdAt)}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                report.status === "PENDING"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : report.status === "APPROVED"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : report.status === "REJECTED"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : "bg-gray-100 text-gray-700"
                                                            }`}>
                                                                {report.status === "PENDING"
                                                                    ? "Pending"
                                                                    : report.status === "APPROVED"
                                                                        ? "Approved"
                                                                        : report.status === "REJECTED"
                                                                            ? "Rejected"
                                                                            : report.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex justify-center space-x-2">
                                                                <button
                                                                    onClick={() => openDetailPage(report)}
                                                                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <ExternalLink size={16} />
                                                                </button>

                                                                {report.status === "PENDING" && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => showConfirmationModal('approve', report.id)}
                                                                            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                                                                            title="Approve"
                                                                            disabled={isUpdating}
                                                                        >
                                                                            <Check size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => showConfirmationModal('reject', report.id)}
                                                                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                                                                            title="Reject"
                                                                            disabled={isUpdating}
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </>
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

                                {/* Pagination Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-blue-100 gap-4">
                                    <div className="text-gray-600">
                                        Showing{" "}
                                        <span className="font-medium">
                                            {reports.length > 0 ? indexOfFirstReport : 0}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {indexOfLastReport}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">{totalElements}</span> reports
                                    </div>
                                    <div className="flex space-x-2 self-center md:self-auto">
                                        <button
                                            className="p-2 rounded-md bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <div className="bg-white border border-blue-200 rounded-md px-4 py-2 flex items-center">
                                            <span className="text-blue-600 font-medium">{currentPage}</span>
                                            <span className="mx-1 text-gray-400">/</span>
                                            <span className="text-gray-600">{totalPages || 1}</span>
                                        </div>
                                        <button
                                            className="p-2 rounded-md bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
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
                                    Are you sure you want to {confirmAction} this report? This action cannot be undone.
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
                                            confirmAction === 'approve'
                                                ? 'bg-green-500 hover:bg-green-600'
                                                : 'bg-red-500 hover:bg-red-600'
                                        } disabled:opacity-50`}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            `${confirmAction === 'approve' ? 'Approve' : 'Reject'}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            } />

            {/* Add route for ReportDetail with the selected report data */}
            <Route path="/:reportId/detail" element={<ReportDetail reportData={selectedReport} />} />
        </Routes>
    );
};

export default ReportList;