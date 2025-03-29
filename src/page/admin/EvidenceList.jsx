import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, Archive, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Sidebar from "../navbar/AdminNavbar.jsx";

const EvidenceList = () => {
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
                { id: 1, name: 'Fingerprint Analysis', type: 'forensic', caseNumber: 'C-2025-001', challenge: 'Marathon Challenge', dateAdded: '2025-03-01', status: 'active', addedBy: 'John Doe' },
                { id: 2, name: 'Witness Statement', type: 'document', caseNumber: 'C-2025-001', challenge: 'Yoga Challenge', dateAdded: '2025-03-02', status: 'pending', addedBy: 'Jane Smith' },
                { id: 3, name: 'Crime Scene Photos', type: 'image', caseNumber: 'C-2025-002', challenge: 'Cycling Challenge', dateAdded: '2025-03-05', status: 'active', addedBy: 'Michael Johnson' },
                { id: 4, name: 'DNA Test Results', type: 'forensic', caseNumber: 'C-2025-003', challenge: 'Running Challenge', dateAdded: '2025-03-07', status: 'active', addedBy: 'Sarah Williams' },
                { id: 5, name: 'Blood Test Report', type: 'forensic', caseNumber: 'C-2025-004', challenge: 'Weightlifting Challenge', dateAdded: '2025-03-08', status: 'archived', addedBy: 'Emily Clark' },
                { id: 6, name: 'GPS Tracking Data', type: 'electronic', caseNumber: 'C-2025-005', challenge: 'Hiking Challenge', dateAdded: '2025-03-09', status: 'pending', addedBy: 'Robert Martinez' },
                { id: 7, name: 'Security Camera Footage', type: 'video', caseNumber: 'C-2025-006', challenge: 'Swimming Challenge', dateAdded: '2025-03-10', status: 'active', addedBy: 'Olivia Lewis' },
                { id: 8, name: 'Suspect Interview', type: 'audio', caseNumber: 'C-2025-007', challenge: 'Boxing Challenge', dateAdded: '2025-03-12', status: 'pending', addedBy: 'Daniel Carter' },
                { id: 9, name: 'Footprint Analysis', type: 'forensic', caseNumber: 'C-2025-008', challenge: 'CrossFit Challenge', dateAdded: '2025-03-14', status: 'archived', addedBy: 'Sophia White' },
                { id: 10, name: 'Vehicle GPS Logs', type: 'electronic', caseNumber: 'C-2025-009', challenge: 'Marathon Challenge', dateAdded: '2025-03-16', status: 'active', addedBy: 'Jack Green' },
                { id: 11, name: 'Email Records', type: 'electronic', caseNumber: 'C-2025-010', challenge: 'Yoga Challenge', dateAdded: '2025-03-17', status: 'active', addedBy: 'Emma Brown' },
                { id: 12, name: 'Phone Records', type: 'document', caseNumber: 'C-2025-011', challenge: 'Cycling Challenge', dateAdded: '2025-03-18', status: 'pending', addedBy: 'William Taylor' },
                { id: 13, name: 'Fiber Analysis', type: 'forensic', caseNumber: 'C-2025-012', challenge: 'Running Challenge', dateAdded: '2025-03-19', status: 'active', addedBy: 'James Wilson' },
                { id: 14, name: 'Ballistics Report', type: 'forensic', caseNumber: 'C-2025-013', challenge: 'Weightlifting Challenge', dateAdded: '2025-03-20', status: 'archived', addedBy: 'Ava Davis' },
                { id: 15, name: 'Financial Records', type: 'document', caseNumber: 'C-2025-014', challenge: 'Hiking Challenge', dateAdded: '2025-03-21', status: 'pending', addedBy: 'Noah Martin' },
                { id: 16, name: 'Handwriting Analysis', type: 'forensic', caseNumber: 'C-2025-015', challenge: 'Swimming Challenge', dateAdded: '2025-03-22', status: 'active', addedBy: 'Isabella Anderson' },
                { id: 17, name: 'Voice Recognition', type: 'audio', caseNumber: 'C-2025-016', challenge: 'Boxing Challenge', dateAdded: '2025-03-23', status: 'pending', addedBy: 'Ethan Thomas' },
                { id: 18, name: 'Soil Sample', type: 'forensic', caseNumber: 'C-2025-017', challenge: 'CrossFit Challenge', dateAdded: '2025-03-24', status: 'archived', addedBy: 'Mia Rodriguez' },
                { id: 19, name: 'Metadata Analysis', type: 'electronic', caseNumber: 'C-2025-018', challenge: 'Marathon Challenge', dateAdded: '2025-03-25', status: 'active', addedBy: 'Benjamin Lee' },
                { id: 20, name: 'Call Logs', type: 'electronic', caseNumber: 'C-2025-019', challenge: 'Yoga Challenge', dateAdded: '2025-03-26', status: 'pending', addedBy: 'Charlotte Scott' }
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
                return 'flex items-center text-green-500';
            case 'pending':
                return 'flex items-center text-yellow-500';
            case 'archived':
                return 'flex items-center text-gray-500';
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
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto p-4">
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                            <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                                <h1 className="text-2xl font-bold text-orange-600 mb-4">Quản lý bằng chứng</h1>
                                <div className="flex flex-col md:flex-row gap-3 justify-between">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm bằng chứng..."
                                            className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                                            <Search size={18} />
                                        </div>
                                    </div>
                                    <div className="md:w-48">
                                        <select
                                            className="w-full p-3 border border-orange-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="active">Đang hoạt động</option>
                                            <option value="pending">Đang chờ xử lý</option>
                                            <option value="archived">Đã lưu trữ</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-orange-100 to-yellow-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-orange-800">Tên bằng chứng</th>
                                            <th className="p-4 text-left font-bold text-orange-800 hidden md:table-cell">Loại</th>
                                            <th className="p-4 text-left font-bold text-orange-800">Thử thách</th>
                                            <th className="p-4 text-left font-bold text-orange-800 hidden md:table-cell">Ngày thêm</th>
                                            <th className="p-4 text-left font-bold text-orange-800">Trạng thái</th>
                                            <th className="p-4 text-left font-bold text-orange-800">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="p-4 text-center text-gray-500">
                                                    Không có bằng chứng nào phù hợp với tìm kiếm của bạn.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentItems.map((item) => (
                                                <tr key={item.id} className="border-b border-orange-50 hover:bg-orange-50 transition-colors">
                                                    <td className="p-4">
                                                            <span className="font-medium text-orange-600 hover:text-orange-800 cursor-pointer hover:underline">
                                                                {item.name}
                                                            </span>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell text-gray-600 capitalize">{item.type}</td>
                                                    <td className="p-4 text-gray-600">{item.challenge}</td>
                                                    <td className="p-4 hidden md:table-cell text-gray-600">{item.dateAdded}</td>
                                                    <td className="p-4">
                                                        <div className={getStatusColor(item.status)}>
                                                            {getStatusIcon(item.status)}
                                                            <span className="text-sm font-medium">
                                                                    {item.status === 'active' && 'Đang hoạt động'}
                                                                {item.status === 'pending' && 'Đang chờ xử lý'}
                                                                {item.status === 'archived' && 'Đã lưu trữ'}
                                                                </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="p-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                className={`p-2 rounded-md transition-colors ${
                                                                    item.status === 'archived'
                                                                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                                        : "bg-red-100 text-red-600 hover:bg-red-200"
                                                                }`}
                                                                title={item.status === 'archived' ? "Khôi phục" : "Lưu trữ"}
                                                            >
                                                                <Archive size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-orange-100 gap-4">
                                <div className="text-gray-600">
                                    Hiển thị <span className="font-medium">{currentItems.length > 0 ? indexOfFirstItem + 1 : 0}</span> đến <span className="font-medium">{indexOfFirstItem + currentItems.length}</span> trong tổng số <span className="font-medium">{filteredItems.length}</span> bằng chứng
                                </div>
                                <div className="flex space-x-2 self-center md:self-auto">
                                    <button
                                        className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                                        <span className="text-orange-600 font-medium">{currentPage}</span>
                                        <span className="mx-1 text-gray-400">/</span>
                                        <span className="text-gray-600">{totalPages}</span>
                                    </div>
                                    <button
                                        className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <footer className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white text-center">
                <p>© 2025 GoBeyond</p>
            </footer>
        </div>
    );
};

export default EvidenceList;