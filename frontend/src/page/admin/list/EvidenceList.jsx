import { useState, useEffect } from 'react';
import { Search, ThumbsUp, ThumbsDown, HourglassIcon } from 'lucide-react';
import { ClockIcon, CheckCircleIcon } from "lucide-react";
import EvidenceDetailModal from "../../../page/admin/detailmodal/EvidenceDetailModal.jsx"; // Fix import path if needed
import { useGetJoinedMembersWithPendingEvidenceQuery } from '../../../service/challengeService.js';
import {
    useGetEvidencesForHostQuery,
    useGetEvidenceCountByStatusQuery // Import the new API query hook
} from '../../../service/evidenceService.js';
import { useTranslation } from "react-i18next"; // Add translation hook

const MemberAndEvidenceManagement = ({ challengeId }) => {
    const { t } = useTranslation(); // Initialize translation hook
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [evidencePage, setEvidencePage] = useState(0);
    const [itemsPerPage] = useState(10);

    // Status mapping functions
    const mapStatusToBackend = (frontendStatus) => {
        switch (frontendStatus) {
            case 'approved':
                return 'APPROVED';
            case 'pending':
                return 'PENDING'; // Changed from 'pending' to 'PENDING' as per backend enum
            case 'rejected':
                return 'REJECTED';
            default:
                return undefined; // For 'all' or any other value
        }
    };

    const mapStatusToDisplay = (backendStatus) => {
        if (!backendStatus) return '';

        switch (backendStatus.toUpperCase()) {
            case 'APPROVED':
                return 'approved';
            case 'PENDING': // Changed from pending to PENDING
                return 'pending'; // Keep frontend term as 'pending'
            case 'REJECTED':
                return 'rejected';
            default:
                return backendStatus.toLowerCase();
        }
    };

    const getTranslatedStatus = (status) => {
        switch (status) {
            case 'approved':
                return t('evidence.status.approved');
            case 'pending':
                return t('evidence.status.pending');
            case 'rejected':
                return t('evidence.status.rejected');
            default:
                return status;
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return t('evidence.invalidDate');

        let dateObj;

        // Xử lý trường hợp dữ liệu là mảng (kiểu cũ)
        if (Array.isArray(dateValue) && dateValue.length >= 3) {
            const [year, month, day] = dateValue;
            dateObj = new Date(year, month - 1, day);
        }
        // Xử lý trường hợp dữ liệu là timestamp hoặc chuỗi ngày tháng
        else {
            try {
                dateObj = new Date(dateValue);
            } catch (error) {
                console.error("Error parsing date:", error);
                return t('evidence.invalidDate');
            }
        }

        // Kiểm tra xem dateObj có phải là ngày hợp lệ không
        if (isNaN(dateObj.getTime())) {
            return t('evidence.invalidDate');
        }

        // Format thành dd/mm/yyyy
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset pagination when debounced search term changes
    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearchTerm]);

    // Reset evidence page when member or filter changes
    useEffect(() => {
        setEvidencePage(0);
    }, [selectedMember, statusFilter]);

    // Fetch members with pending evidence using debounced search term
    const {
        data: membersData,
        isLoading: isLoadingMembers,
        isFetching: isFetchingMembers
    } = useGetJoinedMembersWithPendingEvidenceQuery({
        challengeId,
        keyword: debouncedSearchTerm,
        page: currentPage,
        size: itemsPerPage
    });

    // Fetch evidence for selected member
    const {
        data: evidenceData,
        isLoading: isLoadingEvidence
    } = useGetEvidencesForHostQuery(
        selectedMember ? {
                memberId: selectedMember.id,
                challengeId,
                status: statusFilter !== 'all' ? mapStatusToBackend(statusFilter) : undefined,
                page: evidencePage,
                size: itemsPerPage
            } :
            { skip: true },
        { skip: !selectedMember }
    );
    console.log("Evidence data:", evidenceData);

    // Fetch evidence counts by status for the selected member
    const {
        data: evidenceCountData,
        isLoading: isLoadingEvidenceCount
    } = useGetEvidenceCountByStatusQuery(
        selectedMember ? {
            challengeId,
            memberId: selectedMember.id
        } : { skip: true },
        { skip: !selectedMember }
    );
    console.log("Evidence count data:", evidenceCountData);

    const handleStatusFilterChange = (status) => {
        console.log("Setting status filter to:", status);
        setStatusFilter(status);
        setEvidencePage(0);
    };

    // Updated to store the full evidence object, not just the ID
    const handleEvidenceClick = (evidence) => {
        console.log("Selected evidence:", evidence);
        setSelectedEvidence({
            ...evidence,
            id: evidence.evidenceId,
            name: evidence.memberName || `${t('evidence.evidenceNumber')} #${evidence.evidenceId}`,
            challenge: selectedMember ? `${selectedMember.fullName}'s ${t('evidence.challenge')}` : t('evidence.challenge'),
            submittedAt: evidence.submittedAt,
            dateAdded: formatDate(evidence.submittedAt),
            type: evidence.evidenceUrl?.includes('.mp4') ? "video" : "image",
            status: mapStatusToDisplay(evidence.status),
            addedBy: selectedMember ? selectedMember.fullName : t('evidence.unknown'),
            caseNumber: evidence.evidenceId,
            description: evidence.description || t('evidence.noDescription'),
            evidenceUrl: evidence.evidenceUrl || "/api/placeholder/300/200",
            picture: evidence.evidenceUrl || "/api/placeholder/300/200"
        });
    };

    const handleCloseModal = () => {
        setSelectedEvidence(null);
    };

    const handleAcceptEvidence = (evidenceId) => {
        // Here you would call an API mutation to update the evidence status
        console.log(`Accepting evidence with ID: ${evidenceId}`);
        // After successful update, refetch the evidence data
        setSelectedEvidence(null);
    };

    const handleRejectEvidence = (evidenceId) => {
        // Here you would call an API mutation to update the evidence status
        console.log(`Rejecting evidence with ID: ${evidenceId}`);
        // After successful update, refetch the evidence data
        setSelectedEvidence(null);
    };

    const getEvidenceStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <ThumbsUp className="inline mr-2 text-green-600" size={16} />;
            case 'rejected':
                return <ThumbsDown className="inline mr-2 text-red-600" size={16} />;
            case 'pending':
                return <HourglassIcon className="inline mr-2 text-yellow-600" size={16} />;
            default:
                return null;
        }
    };

    const getEvidenceStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-600 bg-green-100 px-2 py-1 rounded-full';
            case 'rejected':
                return 'text-red-600 bg-red-100 px-2 py-1 rounded-full';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full';
            default:
                return '';
        }
    };

    // Extract pagination info from API response
    const members = membersData?.content || [];
    const totalPages = membersData?.totalPages || 0;
    const totalElements = membersData?.totalElements || 0;
    const currentPageNumber = membersData?.number || 0; // API returns 0-based page numbers

    // Extract evidence pagination info
    const evidenceItems = evidenceData?.content || [];
    const evidenceTotalPages = evidenceData?.totalPages || 0;
    const evidenceTotalElements = evidenceData?.totalElements || 0;
    const evidenceCurrentPage = evidenceData?.number || 0;

    // Use the actual count data from the API
    const memberEvidenceStats = selectedMember ? {
        total: evidenceCountData?.reduce((total, item) => total + (item.count || 0), 0) || 0,
        approved: evidenceCountData?.find(item => item.status === "APPROVED")?.count || 0,
        pending: evidenceCountData?.find(item => item.status === "PENDING")?.count || 0,
        rejected: evidenceCountData?.find(item => item.status === "REJECTED")?.count || 0
    } : null;

    // Pagination handlers
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

    // Evidence pagination handlers
    const paginateEvidence = (pageNumber) => setEvidencePage(pageNumber);
    const nextEvidencePage = () => setEvidencePage(prev => Math.min(prev + 1, evidenceTotalPages - 1));
    const prevEvidencePage = () => setEvidencePage(prev => Math.max(prev - 1, 0));

    const isLoading = isLoadingMembers || isFetchingMembers;

    return (
        <div className="bg-blue-50 flex flex-col">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="container mx-auto p-4 flex-grow">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Left panel - Member List */}
                            <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
                                <div className="bg-blue-100 px-6 py-3 border-b">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-800">{t('evidence.members')}</h2>
                                        <div className="relative max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder={t('evidence.searchMembers')}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t('evidence.memberName')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t('evidence.evidenceCount')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t('evidence.status.title')}</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {members.map((member) => (
                                            <tr
                                                key={member.id}
                                                className={`hover:bg-blue-50 cursor-pointer ${selectedMember?.id === member.id ? 'bg-blue-100' : ''}`}
                                                onClick={() => setSelectedMember(member)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.evidenceCount || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {member.hasPendingEvidence ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <ClockIcon className="mr-1 h-4 w-4" />
                                                            {t('evidence.status.pending')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircleIcon className="mr-1 h-4 w-4" />
                                                            {t('evidence.status.done')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination section for members */}
                                <div className="border-t border-gray-200 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                {t('evidence.pagination.showing')} <span className="font-medium">{members.length > 0 ? currentPageNumber * itemsPerPage + 1 : 0}</span> {t('evidence.pagination.to')}{' '}
                                                <span className="font-medium">{Math.min((currentPageNumber + 1) * itemsPerPage, totalElements)}</span> {t('evidence.pagination.of')}{' '}
                                                <span className="font-medium">{totalElements}</span> {t('evidence.members').toLowerCase()}
                                            </p>
                                        </div>
                                        <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={prevPage}
                                                disabled={currentPageNumber === 0}
                                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPageNumber === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                <span className="sr-only">{t('evidence.pagination.previous')}</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            {totalPages > 0 && [...Array(Math.min(5, totalPages)).keys()].map(number => {
                                                const pageNum = currentPageNumber > 2
                                                    ? currentPageNumber - 2 + number + (totalPages - currentPageNumber < 2 ? totalPages - currentPageNumber - 2 : 0)
                                                    : number;
                                                if (pageNum < totalPages) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => paginate(pageNum)}
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                                currentPageNumber === pageNum
                                                                    ? 'bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 text-white focus:z-20'
                                                                    : 'text-gray-900 hover:bg-gray-50 focus:z-20'
                                                            }`}
                                                        >
                                                            {pageNum + 1}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })}
                                            <button
                                                onClick={nextPage}
                                                disabled={currentPageNumber === totalPages - 1 || totalPages === 0}
                                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${currentPageNumber === totalPages - 1 || totalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                <span className="sr-only">{t('evidence.pagination.next')}</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>

                            {/* Right panel - Evidence List */}
                            <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
                                <div className="bg-blue-100 px-6 py-3 border-b">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {t('evidence.title')} {selectedMember ? `${t('evidence.for')} ${selectedMember.fullName}` : ''}
                                        </h2>
                                        <div className="px-2 py-1 rounded-md text-sm bg-blue-200 text-blue-800">
                                            {statusFilter !== 'all' && (
                                                <span className="flex items-center">
                                                    {getEvidenceStatusIcon(statusFilter)}
                                                    {t('evidence.filtering')}: {getTranslatedStatus(statusFilter)}
                                                    <button
                                                        onClick={() => handleStatusFilterChange('all')}
                                                        className="ml-2 text-blue-500 hover:text-blue-700"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            )}
                                            {statusFilter === 'all' && (
                                                <span>{t('evidence.showingAll')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Member Evidence Statistics with clickable cards */}
                                {selectedMember && (
                                    <div className="p-4 border-b">
                                        <h4 className="font-medium text-lg mb-2">{t('evidence.statistics')}</h4>
                                        {isLoadingEvidenceCount ? (
                                            <div className="flex justify-center items-center h-16">
                                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                {/* Total Evidence (All) */}
                                                <div
                                                    className={`bg-gray-50 p-4 rounded-lg cursor-pointer transform transition-all duration-200 hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
                                                    onClick={() => handleStatusFilterChange('all')}
                                                >
                                                    <p className="text-gray-500 text-sm">{t('evidence.totalEvidence')}</p>
                                                    <p className="text-xl font-bold">{memberEvidenceStats.total}</p>
                                                </div>

                                                {/* Approved */}
                                                <div
                                                    className={`bg-green-50 p-4 rounded-lg cursor-pointer transform transition-all duration-200 hover:shadow-md ${statusFilter === 'approved' ? 'ring-2 ring-green-500 shadow-md' : ''}`}
                                                    onClick={() => handleStatusFilterChange('approved')}
                                                >
                                                    <p className="text-gray-500 text-sm">{t('evidence.status.approved')}</p>
                                                    <div className="flex items-center">
                                                        <ThumbsUp className="mr-2 text-green-600" size={16} />
                                                        <p className="text-xl font-bold text-green-600">{memberEvidenceStats.approved}</p>
                                                    </div>
                                                </div>

                                                {/* Pending */}
                                                <div
                                                    className={`bg-yellow-50 p-4 rounded-lg cursor-pointer transform transition-all duration-200 hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500 shadow-md' : ''}`}
                                                    onClick={() => handleStatusFilterChange('pending')}
                                                >
                                                    <p className="text-gray-500 text-sm">{t('evidence.status.pending')}</p>
                                                    <div className="flex items-center">
                                                        <HourglassIcon className="mr-2 text-yellow-600" size={16} />
                                                        <p className="text-xl font-bold text-yellow-600">{memberEvidenceStats.pending}</p>
                                                    </div>
                                                </div>

                                                {/* Rejected */}
                                                <div
                                                    className={`bg-red-50 p-4 rounded-lg cursor-pointer transform transition-all duration-200 hover:shadow-md ${statusFilter === 'rejected' ? 'ring-2 ring-red-500 shadow-md' : ''}`}
                                                    onClick={() => handleStatusFilterChange('rejected')}
                                                >
                                                    <p className="text-gray-500 text-sm">{t('evidence.status.rejected')}</p>
                                                    <div className="flex items-center">
                                                        <ThumbsDown className="mr-2 text-red-600" size={16} />
                                                        <p className="text-xl font-bold text-red-600">{memberEvidenceStats.rejected}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                                    {selectedMember ? (
                                        isLoadingEvidence ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : evidenceItems.length > 0 ? (
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-blue-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t('evidence.date')}</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{t('evidence.status.title')}</th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {evidenceItems.map((evidence) => {
                                                    // Convert backend status to frontend display format
                                                    const displayStatus = mapStatusToDisplay(evidence.status);

                                                    return (
                                                        <tr
                                                            key={evidence.evidenceId}
                                                            className="hover:bg-blue-50 cursor-pointer"
                                                            onClick={() => handleEvidenceClick(evidence)}
                                                        >
                                                            <td className="px-6 py-4 text-sm text-gray-500 text-left">
                                                                {formatDate(evidence.submittedAt)}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-left">
                                                                <span className={getEvidenceStatusColor(displayStatus)}>
                                                                    {getEvidenceStatusIcon(displayStatus)}
                                                                    {getTranslatedStatus(displayStatus)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                                <p>{t('evidence.noEvidenceFound')}</p>
                                                {statusFilter !== 'all' && (
                                                    <button
                                                        onClick={() => setStatusFilter('all')}
                                                        className="mt-2 text-blue-500 hover:underline"
                                                    >
                                                        {t('evidence.showAllEvidence')}
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex justify-center items-center h-64 text-gray-500">
                                            <p>{t('evidence.selectMember')}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Evidence pagination */}
                                {selectedMember && evidenceItems.length > 0 && (
                                    <div className="border-t border-gray-200 px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    {t('evidence.pagination.showing')} <span className="font-medium">{evidenceItems.length > 0 ? evidenceCurrentPage * itemsPerPage + 1 : 0}</span> {t('evidence.pagination.to')}{' '}
                                                    <span className="font-medium">{Math.min((evidenceCurrentPage + 1) * itemsPerPage, evidenceTotalElements)}</span> {t('evidence.pagination.of')}{' '}
                                                    <span className="font-medium">{evidenceTotalElements}</span> {t('evidence.title').toLowerCase()}
                                                </p>
                                            </div>
                                            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <button
                                                    onClick={prevEvidencePage}
                                                    disabled={evidenceCurrentPage === 0}
                                                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${evidenceCurrentPage === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <span className="sr-only">{t('evidence.pagination.previous')}</span>
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                {evidenceTotalPages > 0 && [...Array(Math.min(5, evidenceTotalPages)).keys()].map(number => {
                                                    const pageNum = evidenceCurrentPage > 2
                                                        ? evidenceCurrentPage - 2 + number + (evidenceTotalPages - evidenceCurrentPage < 2 ? evidenceTotalPages - evidenceCurrentPage - 2 : 0)
                                                        : number;
                                                    if (pageNum < evidenceTotalPages) {
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => paginateEvidence(pageNum)}
                                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                                    evidenceCurrentPage === pageNum
                                                                        ? 'bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 text-white focus:z-20'
                                                                        : 'text-gray-900 hover:bg-gray-50 focus:z-20'
                                                                }`}
                                                            >
                                                                {pageNum + 1}
                                                            </button>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                                <button
                                                    onClick={nextEvidencePage}
                                                    disabled={evidenceCurrentPage === evidenceTotalPages - 1 || evidenceTotalPages === 0}
                                                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${evidenceCurrentPage === evidenceTotalPages - 1 || evidenceTotalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <span className="sr-only">{t('evidence.pagination.next')}</span>
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Evidence Detail Modal */}
            {selectedEvidence && (
                <EvidenceDetailModal
                    evidence={selectedEvidence}
                    onClose={handleCloseModal}
                    onAccept={handleAcceptEvidence}
                    onReject={handleRejectEvidence}
                />
            )}
        </div>
    );
};

export default MemberAndEvidenceManagement;