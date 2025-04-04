import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, Archive, ThumbsUp, ThumbsDown, HourglassIcon } from 'lucide-react';
import Sidebar from "../../navbar/AdminNavbar.jsx";
import EvidenceDetailModal from "../../../component/ChallengeDetailModal.jsx";

const MemberAndEvidenceManagement = () => {
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'approved', 'rejected', 'waiting'];
    const [selectedMember, setSelectedMember] = useState(null);
    const [filteredEvidence, setFilteredEvidence] = useState([]);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Pagination state cho danh sách thành viên
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        setTimeout(() => {
            // Mock data đã được chỉnh sửa để một số thành viên có nhiều hơn 1 bằng chứng
            const mockData = [
                { id: 1, name: 'Fingerprint Analysis', type: 'forensic', caseNumber: 'C-2025-001', challenge: 'Marathon Challenge', challengeType: 'Endurance', dateAdded: '2025-03-01', status: 'approved', addedBy: 'John Doe' },
                { id: 2, name: 'DNA Test', type: 'forensic', caseNumber: 'C-2025-001', challenge: 'Marathon Challenge', challengeType: 'Endurance', dateAdded: '2025-03-02', status: 'waiting', addedBy: 'John Doe' },
                { id: 3, name: 'Witness Statement', type: 'document', caseNumber: 'C-2025-002', challenge: 'Yoga Challenge', challengeType: 'Flexibility', dateAdded: '2025-03-03', status: 'approved', addedBy: 'Jane Smith' },
                { id: 4, name: 'Crime Scene Photos', type: 'image', caseNumber: 'C-2025-003', challenge: 'Yoga Challenge', challengeType: 'Flexibility', dateAdded: '2025-03-04', status: 'approved', addedBy: 'Jane Smith' },
                { id: 5, name: 'DNA Test Results', type: 'forensic', caseNumber: 'C-2025-004', challenge: 'Running Challenge', challengeType: 'Endurance', dateAdded: '2025-03-05', status: 'approved', addedBy: 'Michael Johnson' },
                { id: 6, name: 'Blood Test Report', type: 'forensic', caseNumber: 'C-2025-005', challenge: 'Weightlifting Challenge', challengeType: 'Strength', dateAdded: '2025-03-06', status: 'rejected', addedBy: 'Sarah Williams' },
                { id: 7, name: 'GPS Tracking Data', type: 'electronic', caseNumber: 'C-2025-006', challenge: 'Hiking Challenge', challengeType: 'Outdoor', dateAdded: '2025-03-07', status: 'waiting', addedBy: 'Robert Martinez' },
                { id: 8, name: 'Security Camera Footage', type: 'video', caseNumber: 'C-2025-007', challenge: 'Swimming Challenge', challengeType: 'Cardio', dateAdded: '2025-03-08', status: 'approved', addedBy: 'Olivia Lewis' },
                { id: 9, name: 'Suspect Interview', type: 'audio', caseNumber: 'C-2025-008', challenge: 'Boxing Challenge', challengeType: 'Combat', dateAdded: '2025-03-09', status: 'waiting', addedBy: 'Daniel Carter' },
                { id: 10, name: 'Footprint Analysis', type: 'forensic', caseNumber: 'C-2025-009', challenge: 'CrossFit Challenge', challengeType: 'Mixed', dateAdded: '2025-03-10', status: 'rejected', addedBy: 'Sophia White' },
                { id: 11, name: 'Vehicle GPS Logs', type: 'electronic', caseNumber: 'C-2025-010', challenge: 'Marathon Challenge', challengeType: 'Endurance', dateAdded: '2025-03-11', status: 'approved', addedBy: 'Jack Green' },
                { id: 12, name: 'Email Records', type: 'electronic', caseNumber: 'C-2025-011', challenge: 'Yoga Challenge', challengeType: 'Flexibility', dateAdded: '2025-03-12', status: 'approved', addedBy: 'Emma Brown' },
                { id: 13, name: 'Phone Records', type: 'document', caseNumber: 'C-2025-012', challenge: 'Yoga Challenge', challengeType: 'Flexibility', dateAdded: '2025-03-13', status: 'waiting', addedBy: 'Emma Brown' },
                { id: 14, name: 'Fiber Analysis', type: 'forensic', caseNumber: 'C-2025-013', challenge: 'Running Challenge', challengeType: 'Endurance', dateAdded: '2025-03-14', status: 'approved', addedBy: 'Emily Clark' },
                { id: 15, name: 'Ballistics Report', type: 'forensic', caseNumber: 'C-2025-014', challenge: 'Weightlifting Challenge', challengeType: 'Strength', dateAdded: '2025-03-15', status: 'rejected', addedBy: 'Emily Clark' },
            ];

            setEvidenceItems(mockData);

            // Nhóm dữ liệu theo thành viên (addedBy) để lấy ra tên thành viên, số lượng bằng chứng và trạng thái
            const uniqueMembers = Array.from(new Set(mockData.map(item => item.addedBy)))
                .map(member => {
                    const memberItems = mockData.filter(item => item.addedBy === member);
                    const count = memberItems.length;
                    let status;
                    if (count === 0) {
                        status = 'archived';
                    } else if (memberItems.every(item => item.status === 'approved' || item.status === 'rejected')) {
                        status = 'active';
                    } else if (memberItems.some(item => item.status === 'waiting')) {
                        status = 'pending';
                    } else {
                        status = 'archived';
                    }
                    return {
                        name: member,
                        evidenceCount: count,
                        status
                    };
                });

            setMembers(uniqueMembers);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        const filtered = members.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setCurrentPage(1);
    }, [searchTerm, members]);

    useEffect(() => {
        if (selectedMember) {
            const memberEvidence = evidenceItems.filter(item =>
                item.addedBy === selectedMember &&
                (statusFilter === 'all' || item.status === statusFilter)
            );
            setFilteredEvidence(memberEvidence);
        } else {
            setFilteredEvidence([]);
        }
    }, [selectedMember, statusFilter, evidenceItems]);

    const handleEvidenceClick = (evidence) => {
        setSelectedEvidence(evidence);
    };

    const handleCloseModal = () => {
        setSelectedEvidence(null);
    };

    const handleAcceptEvidence = (id) => {
        const updatedItems = evidenceItems.map(item =>
            item.id === id ? { ...item, status: 'approved' } : item
        );
        setEvidenceItems(updatedItems);
        setSelectedEvidence(null);
    };

    const handleRejectEvidence = (id) => {
        const updatedItems = evidenceItems.map(item =>
            item.id === id ? { ...item, status: 'rejected' } : item
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

    // Phân trang cho danh sách thành viên
    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="bg-red-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="container mx-auto p-4 flex-grow">
                        <h1 className="text-2xl font-bold text-orange-600 mb-6">Member and Evidence Management</h1>
                        {loading ? (
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
                                            {currentMembers.map((member, index) => (
                                                <tr
                                                    key={index}
                                                    className={`hover:bg-orange-50 cursor-pointer ${selectedMember === member.name ? 'bg-orange-100' : ''}`}
                                                    onClick={() => setSelectedMember(member.name)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.evidenceCount}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={getMemberStatusColor(member.status)}>
                                {getMemberStatusIcon(member.status)}
                                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                              </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination for members */}
                                    <div className="border-t border-gray-200 px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                                    <span className="font-medium">{Math.min(indexOfLastItem, filteredMembers.length)}</span> of{' '}
                                                    <span className="font-medium">{filteredMembers.length}</span> members
                                                </p>
                                            </div>
                                            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <button
                                                    onClick={prevPage}
                                                    disabled={currentPage === 1}
                                                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                {[...Array(Math.min(5, totalPages)).keys()].map(number => {
                                                    const pageNum = currentPage > 3
                                                        ? currentPage - 3 + number + (totalPages - currentPage < 2 ? totalPages - currentPage - 2 : 0)
                                                        : number + 1;
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
                                                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
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
                                {/* Right panel - Evidence List for selected member */}
                                <div className="w-full md:w-1/2 bg-white rounded-lg shadow overflow-hidden">
                                    <div className="bg-orange-100 px-6 py-3 border-b flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {selectedMember ? `${selectedMember}'s Evidence` : 'Select a Member'}
                                        </h2>
                                        {selectedMember && (
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
                                    {selectedMember ? (
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
                                                    <p className="text-gray-500 mb-2">No evidence found for this member.</p>
                                                    {selectedMember && (
                                                        <p className="text-sm text-gray-400">
                                                            Try changing the status filter or add new evidence.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64">
                                            <p className="text-gray-500">Select a member to view evidence.</p>
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

export default MemberAndEvidenceManagement;
