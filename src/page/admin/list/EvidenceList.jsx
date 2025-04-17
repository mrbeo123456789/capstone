import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, Clock, Archive, ThumbsUp, ThumbsDown, HourglassIcon } from 'lucide-react';
import { ClockIcon, CheckCircleIcon } from "lucide-react";
import EvidenceDetailModal from "../../../component/ChallengeDetailModal.jsx";
import { useGetJoinedMembersWithPendingEvidenceQuery } from '../../../service/challengeService.js';
import { useGetEvidencesByMemberAndChallengeQuery } from '../../../service/adminService.js';

const MemberAndEvidenceManagement = ({ challengeId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'approved', 'rejected', 'waiting'];
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); // API pagination starts from 0
    const [itemsPerPage] = useState(10);

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
    console.log(membersData);

    // Fetch evidence for selected member
    const {
        data: evidenceData,
        isLoading: isLoadingEvidence
    } = useGetEvidencesByMemberAndChallengeQuery(
        selectedMember ? {
                memberId: selectedMember.id,
                challengeId,
                page: 0 // Always start at first page when changing member
            } :
            { skip: true }, // Skip fetching if no member is selected
        { skip: !selectedMember }
    );
    console.log(evidenceData);

    const handleEvidenceClick = (evidence) => {
        setSelectedEvidence(evidence);
    };

    const handleCloseModal = () => {
        setSelectedEvidence(null);
    };

    const handleAcceptEvidence = (id) => {
        // Here you would call an API mutation to update the evidence status
        // After successful update, refetch the evidence data
        setSelectedEvidence(null);
    };

    const handleRejectEvidence = (id) => {
        // Here you would call an API mutation to update the evidence status
        // After successful update, refetch the evidence data
        setSelectedEvidence(null);
    };

    const getEvidenceStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <ThumbsUp className="inline mr-2 text-green-600" size={16} />;
            case 'rejected':
                return <ThumbsDown className="inline mr-2 text-red-600" size={16} />;
            case 'waiting':
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
            case 'waiting':
                return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full';
            default:
                return '';
        }
    };

    const getMemberStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="inline mr-2 text-green-600" size={16} />;
            case 'pending':
                return <Clock className="inline mr-2 text-yellow-600" size={16} />;
            case 'archived':
                return <Archive className="inline mr-2 text-gray-600" size={16} />;
            default:
                return null;
        }
    };

    const getMemberStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100 px-2 py-1 rounded-full';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full';
            case 'archived':
                return 'text-gray-600 bg-gray-100 px-2 py-1 rounded-full';
            default:
                return '';
        }
    };

    // Extract pagination info from API response
    const members = membersData?.content || [];
    const totalPages = membersData?.totalPages || 0;
    const totalElements = membersData?.totalElements || 0;
    const currentPageNumber = membersData?.number || 0; // API returns 0-based page numbers

    // Filter evidence data based on status
    const filteredEvidence = evidenceData?.content?.filter(item =>
        statusFilter === 'all' || item.status === statusFilter
    ) || [];

    // Pagination handlers
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

    const isLoading = isLoadingMembers || isFetchingMembers;

    return (
        <div className="bg-red-50 min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="container mx-auto p-4 flex-grow">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Left panel - Member List */}
                            <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
                                <div className="bg-orange-100 px-6 py-3 border-b">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-800">Members</h2>
                                        <div className="relative max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search members..."
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Rest of the component remains the same */}
                                {/* ... */}
                                <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-orange-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Member Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Evidence Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {members.map((member) => (
                                            <tr
                                                key={member.id}
                                                className={`hover:bg-orange-50 cursor-pointer ${selectedMember?.id === member.id ? 'bg-orange-100' : ''}`}
                                                onClick={() => setSelectedMember(member)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.evidenceCount || 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {member.hasPendingEvidence ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <ClockIcon className="mr-1 h-4 w-4" />
                                Pending
                            </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="mr-1 h-4 w-4" />
                                Done
                            </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination section - unchanged */}
                                <div className="border-t border-gray-200 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{members.length > 0 ? currentPageNumber * itemsPerPage + 1 : 0}</span> to{' '}
                                                <span className="font-medium">{Math.min((currentPageNumber + 1) * itemsPerPage, totalElements)}</span> of{' '}
                                                <span className="font-medium">{totalElements}</span> members
                                            </p>
                                        </div>
                                        <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                            <button
                                                onClick={prevPage}
                                                disabled={currentPageNumber === 0}
                                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPageNumber === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                <span className="sr-only">Previous</span>
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
                                                                    ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white focus:z-20'
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
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                            {/* Right panel - Evidence List - unchanged */}
                            <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
                                {/* Evidence content remains the same */}
                                {/* ... */}
                            </div>
                        </div>
                    )}
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
        </div>
    );
};

export default MemberAndEvidenceManagement;