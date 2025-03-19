import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, Archive, ThumbsUp, ThumbsDown, HourglassIcon } from 'lucide-react';
import Sidebar from "../navbar/AdminNavbar.jsx";
import EvidenceDetailModal from "../../component/ChallengeDetailModal.jsx";

const ChallengeAndEvidenceList = () => {
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'approved', 'rejected', 'waiting'];
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [filteredEvidence, setFilteredEvidence] = useState([]);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Pagination state for challenges
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    useEffect(() => {
        setTimeout(() => {
            const mockData = [
                { id: 1, name: 'Fingerprint Analysis', type: 'forensic', caseNumber: 'C-2025-001', challenge: 'Marathon Challenge', challengeType: 'Endurance', dateAdded: '2025-03-01', status: 'approved', addedBy: 'John Doe' },
                { id: 2, name: 'Witness Statement', type: 'document', caseNumber: 'C-2025-001', challenge: 'Yoga Challenge', challengeType: 'Flexibility', dateAdded: '2025-03-02', status: 'waiting', addedBy: 'Jane Smith' },
                { id: 3, name: 'Crime Scene Photos', type: 'image', caseNumber: 'C-2025-002', challenge: 'Cycling Challenge', challengeType: 'Cardio', dateAdded: '2025-03-05', status: 'approved', addedBy: 'Michael Johnson' },
                { id: 4, name: 'DNA Test Results', type: 'forensic', caseNumber: 'C-2025-003', challenge: 'Running Challenge', challengeType: 'Endurance', dateAdded: '2025-03-07', status: 'approved', addedBy: 'Sarah Williams' },
                { id: 5, name: 'Blood Test Report', type: 'forensic', caseNumber: 'C-2025-004', challenge: 'Weightlifting Challenge', challengeType: 'Strength', dateAdded: '2025-03-08', status: 'rejected', addedBy: 'Emily Clark' },
                { id: 6, name: 'GPS Tracking Data', type: 'electronic', caseNumber: 'C-2025-005', challenge: 'Hiking Challenge', challengeType: 'Outdoor', dateAdded: '2025-03-09', status: 'waiting', addedBy: 'Robert Martinez' },
                { id: 7, name: 'Security Camera Footage', type: 'video', caseNumber: 'C-2025-006', challenge: 'Swimming Challenge', challengeType: 'Cardio', dateAdded: '2025-03-10', status: 'approved', addedBy: 'Olivia Lewis' },
                { id: 8, name: 'Suspect Interview', type: 'audio', caseNumber: 'C-2025-007', challenge: 'Boxing Challenge', challengeType: 'Combat', dateAdded: '2025-03-12', status: 'waiting', addedBy: 'Daniel Carter' },
                { id: 9, name: 'Footprint Analysis', type: 'forensic', caseNumber: 'C-2025-008', challenge: 'CrossFit Challenge', challengeType: 'Mixed', dateAdded: '2025-03-14', status: 'rejected', addedBy: 'Sophia White' },
                { id: 10, name: 'Vehicle GPS Logs', type: 'electronic', caseNumber: 'C-2025-009', challenge: 'Marathon Challenge', challengeType: 'Endurance', dateAdded: '2025-03-16', status: 'approved', addedBy: 'Jack Green' },
                { id: 11, name: 'Email Records', type: 'electronic', caseNumber: 'C-2025-010', challenge: 'Yoga Challenge', challengeType: 'Flexibility', dateAdded: '2025-03-17', status: 'approved', addedBy: 'Emma Brown' },
                { id: 12, name: 'Phone Records', type: 'document', caseNumber: 'C-2025-011', challenge: 'Cycling Challenge', challengeType: 'Cardio', dateAdded: '2025-03-18', status: 'waiting', addedBy: 'William Taylor' },
                { id: 13, name: 'Fiber Analysis', type: 'forensic', caseNumber: 'C-2025-012', challenge: 'Running Challenge', challengeType: 'Endurance', dateAdded: '2025-03-19', status: 'approved', addedBy: 'James Wilson' },
                { id: 14, name: 'Ballistics Report', type: 'forensic', caseNumber: 'C-2025-013', challenge: 'Weightlifting Challenge', challengeType: 'Strength', dateAdded: '2025-03-20', status: 'rejected', addedBy: 'Ava Davis' },
                { id: 15, name: 'Financial Records', type: 'document', caseNumber: 'C-2025-014', challenge: 'Hiking Challenge', challengeType: 'Outdoor', dateAdded: '2025-03-21', status: 'waiting', addedBy: 'Noah Martin' },
                { id: 16, name: 'Handwriting Analysis', type: 'forensic', caseNumber: 'C-2025-015', challenge: 'Swimming Challenge', challengeType: 'Cardio', dateAdded: '2025-03-22', status: 'approved', addedBy: 'Isabella Anderson' },
                { id: 17, name: 'Voice Recognition', type: 'audio', caseNumber: 'C-2025-016', challenge: 'Boxing Challenge', challengeType: 'Combat', dateAdded: '2025-03-23', status: 'waiting', addedBy: 'Ethan Thomas' },
                { id: 18, name: 'Soil Sample', type: 'forensic', caseNumber: 'C-2025-017', challenge: 'CrossFit Challenge', challengeType: 'Mixed', dateAdded: '2025-03-24', status: 'rejected', addedBy: 'Mia Rodriguez' },
                { id: 19, name: 'Metadata Analysis', type: 'electronic', caseNumber: 'C-2025-018', challenge: 'Marathon Challenge', challengeType: 'Endurance', dateAdded: '2025-03-25', status: 'approved', addedBy: 'Benjamin Lee' },
            ];

            setEvidenceItems(mockData);

            // Extract unique challenges with type and determine status
            const uniqueChallenges = Array.from(new Set(mockData.map(item => item.challenge)))
                .map(challenge => {
                    const challengeItems = mockData.filter(item => item.challenge === challenge);
                    const type = challengeItems[0].challengeType; // Get type from first evidence item
                    const count = challengeItems.length;

                    // Determine challenge status based on evidence statuses
                    let status;
                    if (count === 0) {
                        status = 'archived'; // No evidence
                    } else if (challengeItems.every(item => item.status === 'approved' || item.status === 'rejected')) {
                        status = 'active'; // All evidence is either approved or rejected
                    } else if (challengeItems.some(item => item.status === 'waiting')) {
                        status = 'pending'; // Some evidence is still waiting
                    } else {
                        status = 'archived'; // Fallback
                    }

                    return {
                        name: challenge,
                        type,
                        count,
                        status
                    };
                });

            // Add a challenge with no evidence
            uniqueChallenges.push({
                name: 'Meditation Challenge',
                type: 'Mindfulness',
                count: 0,
                status: 'archived'
            });

            setChallenges(uniqueChallenges);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        // Filter challenges based on search term
        const filtered = challenges.filter(challenge =>
            challenge.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Reset pagination when search changes
        setCurrentPage(1);
    }, [searchTerm, challenges]);

    useEffect(() => {
        // Filter evidence for selected challenge
        if (selectedChallenge) {
            const challengeEvidence = evidenceItems.filter(item =>
                item.challenge === selectedChallenge &&
                (statusFilter === 'all' || item.status === statusFilter)
            );
            setFilteredEvidence(challengeEvidence);
        } else {
            setFilteredEvidence([]);
        }
    }, [selectedChallenge, statusFilter, evidenceItems]);

    const handleEvidenceClick = (evidence) => {
        setSelectedEvidence(evidence);
    };

    const handleCloseModal = () => {
        setSelectedEvidence(null);
    };

    const handleAcceptEvidence = (id) => {
        // Update the evidence status
        const updatedItems = evidenceItems.map(item =>
            item.id === id ? {...item, status: 'approved'} : item
        );
        setEvidenceItems(updatedItems);
        setSelectedEvidence(null);
    };

    const handleRejectEvidence = (id) => {
        // Update the evidence status
        const updatedItems = evidenceItems.map(item =>
            item.id === id ? {...item, status: 'rejected'} : item
        );
        setEvidenceItems(updatedItems);
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

    const getChallengeStatusIcon = (status) => {
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

    const getChallengeStatusColor = (status) => {
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

    // Get current page items for challenges
    const filteredChallenges = challenges.filter(challenge =>
        challenge.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentChallenges = filteredChallenges.slice(indexOfFirstItem, indexOfLastItem);

    // Calculate total pages
    const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="bg-red-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
            <div className={`transition-all duration-300  ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
            </div>

                <div className="flex-1 flex flex-col overflow-hidden">
            <div className="container mx-auto p-4 flex-grow">
                <h1 className="text-2xl font-bold text-orange-600 mb-6">Challenge and Evidence Management</h1>

                {/* Search bar */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Left panel - Challenge List */}
                        <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-orange-100 px-6 py-3 border-b">
                                <h2 className="text-lg font-semibold text-gray-800">Challenges</h2>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-orange-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Challenge Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Evidence Count</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentChallenges.map((challenge, index) => (
                                        <tr
                                            key={index}
                                            className={`hover:bg-orange-50 cursor-pointer ${selectedChallenge === challenge.name ? 'bg-orange-100' : ''}`}
                                            onClick={() => setSelectedChallenge(challenge.name)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{challenge.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{challenge.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{challenge.count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={getChallengeStatusColor(challenge.status)}>
                                                        {getChallengeStatusIcon(challenge.status)}
                                                        {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination for challenges */}
                            <div className="border-t border-gray-200 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(indexOfLastItem, filteredChallenges.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{filteredChallenges.length}</span> challenges
                                        </p>
                                    </div>
                                    <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                                                currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* Page numbers */}
                                        {[...Array(Math.min(5, totalPages)).keys()].map(number => {
                                            // Show pages around current page
                                            const pageNum = currentPage > 3 ?
                                                currentPage - 3 + number + (totalPages - currentPage < 2 ? totalPages - currentPage - 2 : 0) :
                                                number + 1;

                                            if (pageNum <= totalPages) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => paginate(pageNum)}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                            currentPage === pageNum
                                                                ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white focus:z-20'
                                                                : 'text-gray-900 hover:bg-gray-50 focus:z-20'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                                                currentPage === totalPages || totalPages === 0
                                                    ? 'text-gray-300'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                            }`}
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

                        {/* Right panel - Evidence List for selected challenge */}
                        <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-orange-100 px-6 py-3 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {selectedChallenge ? `${selectedChallenge} Evidence` : 'Select a Challenge'}
                                </h2>

                                {selectedChallenge && (
                                    <div className="flex items-center">
                                        <label className="text-sm text-gray-600 mr-2">Status:</label>
                                        <select
                                            className="text-sm border rounded-md bg-white px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {selectedChallenge ? (
                                <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                                    {filteredEvidence.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-orange-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Evidence Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date Added</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredEvidence.map((item) => (
                                                <tr key={item.id} className="hover:bg-orange-50">
                                                    <td
                                                        className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:text-orange-600"
                                                        onClick={() => handleEvidenceClick(item)}
                                                    >
                                                        {item.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dateAdded}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={getEvidenceStatusColor(item.status)}>
                                                                {getEvidenceStatusIcon(item.status)}
                                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                            </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64">
                                            <p className="text-gray-500 mb-2">No evidence found for this challenge.</p>
                                            {selectedChallenge && (
                                                <p className="text-sm text-gray-400">
                                                    Try changing the status filter or add new evidence.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <p className="text-gray-500">Select a challenge to view evidence.</p>
                                </div>
                            )}
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
        </div>
    );
};

export default ChallengeAndEvidenceList;