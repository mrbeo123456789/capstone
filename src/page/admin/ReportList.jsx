import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, Archive } from 'lucide-react';
import Navbar from "../navbar/AdminNavbar.jsx";

const ReportList = () => {
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'active', 'pending', 'archived'];
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        setTimeout(() => {
            const mockData = [
                { id: 1, name: 'Fingerprint Analysis', type: 'forensic', caseNumber: 'C-2025-001', member: 'Marathon Challenge', date: '2025-03-01', status: 'active', addedBy: 'John Doe' },
                { id: 2, name: 'Witness Statement', type: 'document', caseNumber: 'C-2025-001', member: 'Yoga Challenge', date: '2025-03-02', status: 'pending', addedBy: 'Jane Smith' },
                { id: 3, name: 'Crime Scene Photos', type: 'image', caseNumber: 'C-2025-002', member: 'Cycling Challenge', date: '2025-03-05', status: 'active', addedBy: 'Michael Johnson' },
                { id: 4, name: 'DNA Test Results', type: 'forensic', caseNumber: 'C-2025-003', member: 'Running Challenge', date: '2025-03-07', status: 'active', addedBy: 'Sarah Williams' },
                { id: 5, name: 'Blood Test Report', type: 'forensic', caseNumber: 'C-2025-004', member: 'Weightlifting Challenge', date: '2025-03-08', status: 'archived', addedBy: 'Emily Clark' },
                { id: 6, name: 'GPS Tracking Data', type: 'electronic', caseNumber: 'C-2025-005', member: 'Hiking Challenge', date: '2025-03-09', status: 'pending', addedBy: 'Robert Martinez' },
                { id: 7, name: 'Security Camera Footage', type: 'video', caseNumber: 'C-2025-006', member: 'Swimming Challenge', date: '2025-03-10', status: 'active', addedBy: 'Olivia Lewis' },
                { id: 8, name: 'Suspect Interview', type: 'audio', caseNumber: 'C-2025-007', member: 'Boxing Challenge', date: '2025-03-12', status: 'pending', addedBy: 'Daniel Carter' },
                { id: 9, name: 'Footprint Analysis', type: 'forensic', caseNumber: 'C-2025-008', member: 'CrossFit Challenge', date: '2025-03-14', status: 'archived', addedBy: 'Sophia White' },
                { id: 10, name: 'Vehicle GPS Logs', type: 'electronic', caseNumber: 'C-2025-009', member: 'Marathon Challenge', date: '2025-03-16', status: 'active', addedBy: 'Jack Green' },
                { id: 11, name: 'Email Records', type: 'electronic', caseNumber: 'C-2025-010', member: 'Yoga Challenge', date: '2025-03-17', status: 'active', addedBy: 'Emma Brown' },
                { id: 12, name: 'Phone Records', type: 'document', caseNumber: 'C-2025-011', member: 'Cycling Challenge', date: '2025-03-18', status: 'pending', addedBy: 'William Taylor' },
                { id: 13, name: 'Fiber Analysis', type: 'forensic', caseNumber: 'C-2025-012', member: 'Running Challenge', date: '2025-03-19', status: 'active', addedBy: 'James Wilson' },
                { id: 14, name: 'Ballistics Report', type: 'forensic', caseNumber: 'C-2025-013', member: 'Weightlifting Challenge', date: '2025-03-20', status: 'archived', addedBy: 'Ava Davis' },
                { id: 15, name: 'Financial Records', type: 'document', caseNumber: 'C-2025-014', member: 'Hiking Challenge', date: '2025-03-21', status: 'pending', addedBy: 'Noah Martin' },
                { id: 16, name: 'Handwriting Analysis', type: 'forensic', caseNumber: 'C-2025-015', member: 'Swimming Challenge', date: '2025-03-22', status: 'active', addedBy: 'Isabella Anderson' },
                { id: 17, name: 'Voice Recognition', type: 'audio', caseNumber: 'C-2025-016', member: 'Boxing Challenge', date: '2025-03-23', status: 'pending', addedBy: 'Ethan Thomas' },
                { id: 18, name: 'Soil Sample', type: 'forensic', caseNumber: 'C-2025-017', member: 'CrossFit Challenge', date: '2025-03-24', status: 'archived', addedBy: 'Mia Rodriguez' },
                { id: 19, name: 'Metadata Analysis', type: 'electronic', caseNumber: 'C-2025-018', member: 'Marathon Challenge', date: '2025-03-25', status: 'active', addedBy: 'Benjamin Lee' },
                { id: 20, name: 'Call Logs', type: 'electronic', caseNumber: 'C-2025-019', member: 'Yoga Challenge', date: '2025-03-26', status: 'pending', addedBy: 'Charlotte Scott' }
            ];
            setEvidenceItems(mockData);
            setFilteredItems(mockData);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        let filtered = evidenceItems.filter(item =>
            (statusFilter === 'all' || item.status === statusFilter) &&
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.challenge.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredItems(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, statusFilter, evidenceItems]);

    const getStatusIcon = (status) => {
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

    const getStatusColor = (status) => {
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

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Calculate total pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
            {/* Import Header Component */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Collapsible */}
                <div className={`transition-all duration-300  ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}/>
                </div>
            <div className="container mx-auto p-4 bg-red-50">

                <h1 className="text-2xl font-bold text-orange-600 mb-6">Evidence List</h1>

                <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                        <input
                            type="text"
                            placeholder="Search evidence..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-orange-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Challenge
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Member Report</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                        <select
                                            className="ml-2 text-xs border-none bg-transparent focus:ring-0 focus:outline-none"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            {statuses.map(status => (
                                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                            ))}
                                        </select>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-orange-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.member}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={getStatusColor(item.status)}>
                                        {getStatusIcon(item.status)}
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* Pagination - Matching the provided style */}
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                                            currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                                            currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                            <span className="font-medium">
                                        {Math.min(indexOfLastItem, filteredItems.length)}
                                    </span>{' '}
                                            of <span className="font-medium">{filteredItems.length}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
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
                                            {[...Array(totalPages).keys()].map(number => (
                                                <button
                                                    key={number + 1}
                                                    onClick={() => paginate(number + 1)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                        currentPage === number + 1
                                                            ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white focus:z-20'
                                                            : 'text-gray-900 hover:bg-gray-50 focus:z-20'
                                                    }`}
                                                >
                                                    {number + 1}
                                                </button>
                                            ))}

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
                        </>
                    )}


                </div>
            </div>
            </div>
        </div>

    );
};

export default ReportList;