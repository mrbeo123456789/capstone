import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import Navbar from "../navbar/AdminNavbar.jsx";

const EvidenceList = () => {
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'active', 'pending', 'archived'];

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
                { id: 10, name: 'Vehicle GPS Logs', type: 'electronic', caseNumber: 'C-2025-009', challenge: 'Marathon Challenge', dateAdded: '2025-03-16', status: 'active', addedBy: 'Jack Green' }
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
    }, [searchTerm, statusFilter, evidenceItems]);

    return (
        <div className="container mx-auto p-4 bg-red-50 min-h-screen">
            <Navbar/>
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
                <select
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    {statuses.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-orange-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Evidence
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Challenge</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Date
                                Added
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-orange-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.challenge}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dateAdded}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            <footer className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-4 text-white text-center">
                <p>© 2025 GoBeyond</p>
            </footer>
        </div>
    );
};

export default EvidenceList;
