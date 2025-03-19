import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import Navbar from "../navbar/AdminNavbar.jsx";
import ChallengeDetailModal from "../../component/ChallengeDetailModal.jsx"; // Import the new modal component

const ChallengeList = () => {
    // Sample data with more challenges
    const allChallenges = [
        { id: 1, name: 'Giacomo Guilizzoni', type: 'Running', date: '01/01/2022', duration: '2 months', status: 'accepted' },
        { id: 2, name: 'Marco Botton', type: 'Workout', date: '13/10/2024', duration: '6 months', status: 'waiting' },
        { id: 3, name: 'Mariah Maclachlan', type: 'Gym', date: '05/04/2025', duration: '3 months', status: 'rejected' },
        { id: 4, name: 'Val Head', type: 'Cycling', date: '15/07/2023', duration: '1 month', status: 'accepted' },
        { id: 5, name: 'Bill Fisher', type: 'Yoga', date: '20/11/2024', duration: '2 weeks', status: 'waiting' },
        { id: 6, name: 'Jared Erondu', type: 'Swimming', date: '09/09/2022', duration: '4 months', status: 'accepted' },
        { id: 7, name: 'Zara Ali', type: 'Running', date: '22/12/2023', duration: '1 year', status: 'rejected' },
        { id: 8, name: 'Liam Nguyen', type: 'Workout', date: '03/03/2025', duration: '3 months', status: 'waiting' },
        { id: 9, name: 'Emma Johansson', type: 'Gym', date: '18/05/2024', duration: '6 months', status: 'accepted' },
        { id: 10, name: 'Noah Kim', type: 'Yoga', date: '25/06/2024', duration: '2 months', status: 'accepted' },
        { id: 11, name: 'Olivia Smith', type: 'Cycling', date: '14/08/2023', duration: '1 month', status: 'waiting' },
        { id: 12, name: 'William Chen', type: 'Swimming', date: '02/02/2025', duration: '5 months', status: 'rejected' },
        { id: 13, name: 'Sophia Brown', type: 'Running', date: '12/11/2022', duration: '2 weeks', status: 'accepted' },
        { id: 14, name: 'Mason Lee', type: 'Workout', date: '27/10/2024', duration: '4 months', status: 'waiting' },
        { id: 15, name: 'Isabella Davis', type: 'Gym', date: '19/03/2025', duration: '3 months', status: 'accepted' },
        { id: 16, name: 'James Wilson', type: 'Yoga', date: '30/09/2023', duration: '1 year', status: 'rejected' },
        { id: 17, name: 'Ava Garcia', type: 'Cycling', date: '06/06/2024', duration: '6 months', status: 'accepted' },
        { id: 18, name: 'Lucas Martinez', type: 'Swimming', date: '11/01/2023', duration: '2 months', status: 'waiting' },
        { id: 19, name: 'Mia Hernandez', type: 'Running', date: '08/08/2024', duration: '3 months', status: 'accepted' },
        { id: 20, name: 'Ethan Robinson', type: 'Workout', date: '17/05/2025', duration: '4 months', status: 'rejected' },
    ];


    const [filterStatus, setFilterStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [challenges, setChallenges] = useState(allChallenges);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const challengesPerPage = 10;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState(null);

    // Handle opening the modal with challenge details
    const handleOpenModal = (challengeId) => {
        // Simulate fetching challenge details
        setTimeout(() => {
            const challenge = {
                id: challengeId,
                name: challenges.find(c => c.id === challengeId)?.name || 'Unknown',
                type: challenges.find(c => c.id === challengeId)?.type || 'Unknown',
                date: challenges.find(c => c.id === challengeId)?.date || 'Unknown',
                duration: challenges.find(c => c.id === challengeId)?.duration || 'Unknown',
                status: challenges.find(c => c.id === challengeId)?.status || 'Unknown',
                description: 'This challenge aims to improve health and endurance through consistent training.',
                goal: 'Complete the challenge within the given timeframe',
                participantCount: 45,
                completionRate: 78,
                comments: [
                    { user: 'Admin', date: '05/01/2022', text: 'Challenge approved and launched.' },
                    { user: 'User', date: '15/01/2022', text: 'First week completed, feeling great!' },
                    { user: 'Coach', date: '22/01/2022', text: 'Keep up the good pace, remember to hydrate properly.' }
                ]
            };

            setSelectedChallenge(challenge);
            setIsModalOpen(true);
        }, 300);
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Handle action buttons
    const handleAction = (challengeId, action) => {
        console.log(`Challenge #${challengeId} ${action}`);

        // Update the status in the state
        const updatedChallenges = challenges.map(challenge => {
            if (challenge.id === challengeId) {
                return {
                    ...challenge,
                    status: action === 'confirmed' ? 'accepted' : 'rejected'
                };
            }
            return challenge;
        });

        setChallenges(updatedChallenges);

        // If the modal is open and showing this challenge, update its status too
        if (selectedChallenge && selectedChallenge.id === challengeId) {
            setSelectedChallenge({
                ...selectedChallenge,
                status: action === 'confirmed' ? 'accepted' : 'rejected'
            });
        }

        alert(`Challenge #${challengeId} ${action} successfully`);
    };

    // Handle status change in modal
    const handleStatusChange = (newStatus) => {
        if (selectedChallenge) {
            // Update the challenge in the modal
            setSelectedChallenge({
                ...selectedChallenge,
                status: newStatus
            });

            // Also update the challenge in the main list
            const updatedChallenges = challenges.map(challenge => {
                if (challenge.id === selectedChallenge.id) {
                    return {
                        ...challenge,
                        status: newStatus
                    };
                }
                return challenge;
            });

            setChallenges(updatedChallenges);
            alert(`Challenge status updated to: ${newStatus}`);
        }
    };

    // Filter and search challenges
    useEffect(() => {
        let result = allChallenges;

        // Apply status filter if selected
        if (filterStatus) {
            result = result.filter(challenge => challenge.status === filterStatus);
        }

        // Apply search term filter if present
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(challenge =>
                challenge.name.toLowerCase().includes(term) ||
                challenge.type.toLowerCase().includes(term)
            );
        }

        setChallenges(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [filterStatus, searchTerm]);

    // Get current challenges for pagination
    const indexOfLastChallenge = currentPage * challengesPerPage;
    const indexOfFirstChallenge = indexOfLastChallenge - challengesPerPage;
    const currentChallenges = challenges.slice(indexOfFirstChallenge, indexOfLastChallenge);
    const totalPages = Math.ceil(challenges.length / challengesPerPage);

    // Handle status filter toggle
    const handleStatusFilter = (status) => {
        setFilterStatus(status);
        setIsStatusDropdownOpen(false);
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Toggle status dropdown
    const toggleStatusDropdown = () => {
        setIsStatusDropdownOpen(!isStatusDropdownOpen);
    };

    // Pagination controls
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
            {/* Import Header Component */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow">
                <div className="max-w-6xl mx-auto p-6 mt-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Challenge Management</h1>

                    {/* Table Container with Search Bar */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Search Bar - Right above the table */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative max-w-md mx-auto">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search challenges by name or type..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        {/* Challenge Table */}
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gradient-to-r from-red-100 via-orange-50 to-yellow-50">
                                <th className="py-3 px-4 text-left border-b border-gray-200 font-semibold text-gray-700 w-2/5">Name</th>
                                <th className="py-3 px-4 text-left border-b border-gray-200 font-semibold text-gray-700 w-1/6">Type</th>
                                <th className="py-3 px-4 text-left border-b border-gray-200 font-semibold text-gray-700 w-1/6">Star Date</th>
                                <th className="py-3 px-4 text-left border-b border-gray-200 font-semibold text-gray-700 w-1/6">Duration</th>
                                <th className="py-3 px-4 text-left border-b border-gray-200 font-semibold text-gray-700 w-1/6">
                                    <div className="relative">
                                        <button
                                            onClick={toggleStatusDropdown}
                                            className="flex items-center focus:outline-none"
                                        >
                                            <span>Status</span>
                                            <ChevronDown size={16} className="ml-1" />
                                        </button>

                                        {/* Status Filter Dropdown */}
                                        {isStatusDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleStatusFilter(null)}
                                                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${filterStatus === null ? 'bg-gray-100' : ''}`}
                                                    >
                                                        All
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusFilter('accepted')}
                                                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${filterStatus === 'accepted' ? 'bg-gray-100' : ''}`}
                                                    >
                                                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                        Accepted
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusFilter('waiting')}
                                                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${filterStatus === 'waiting' ? 'bg-gray-100' : ''}`}
                                                    >
                                                        <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                                        Waiting
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusFilter('rejected')}
                                                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${filterStatus === 'rejected' ? 'bg-gray-100' : ''}`}
                                                    >
                                                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                                        Rejected
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </th>
                                <th className="py-3 px-4 text-left border-b border-gray-200 font-semibold text-gray-700 w-1/6">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentChallenges.map((challenge) => (
                                <tr key={challenge.id} className="hover:bg-yellow-50">
                                    <td className="py-3 px-4 border-b border-gray-200">
                                        <button
                                            onClick={() => handleOpenModal(challenge.id)}
                                            className="text-orange-600 hover:text-red-600 hover:underline text-left"
                                        >
                                            {challenge.name}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200">{challenge.type}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{challenge.date}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">{challenge.duration}</td>
                                    <td className="py-3 px-4 border-b border-gray-200">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                challenge.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    challenge.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {challenge.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-200">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAction(challenge.id, 'confirmed')}
                                                className="p-1 rounded hover:bg-green-100 transition-colors"
                                                title="Confirm Challenge"
                                            >
                                                <CheckCircle size={20} className="text-green-600" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(challenge.id, 'rejected')}
                                                className="p-1 rounded hover:bg-red-100 transition-colors"
                                                title="Reject Challenge"
                                            >
                                                <XCircle size={20} className="text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {currentChallenges.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">
                                        No challenges found matching your criteria
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        {/* Pagination */}
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
                                        Showing <span className="font-medium">{indexOfFirstChallenge + 1}</span> to{' '}
                                        <span className="font-medium">
                        {Math.min(indexOfLastChallenge, challenges.length)}
                      </span>{' '}
                                        of <span className="font-medium">{challenges.length}</span> results
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
                    </div>
                </div>
            </main>

            {/* Use the ChallengeDetailModal component */}
            <ChallengeDetailModal
                challenge={selectedChallenge}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onStatusChange={handleStatusChange}
            />

            {/* Footer */}
            <footer className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-4 text-white text-center">
                <p>© 2025 GoBeyond</p>
            </footer>
        </div>
    );
};

export default ChallengeList;