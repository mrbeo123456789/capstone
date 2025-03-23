import { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import Navbar from "../navbar/AdminNavbar.jsx";
import {useNavigate} from "react-router-dom";

const ChallengeList = () => {
    // Sample data with more challenges
    const allChallenges = [
        { id: 1, name: 'Giacomo Guilizzoni', type: 'Running', date: '01/01/2022', duration: '2 months', status: 'accepted', description: 'A running challenge for beginners', thumbnail: '/api/placeholder/40/40' },
        { id: 2, name: 'Marco Botton', type: 'Workout', date: '13/10/2024', duration: '6 months', status: 'waiting', description: 'High intensity workout sessions', thumbnail: '/api/placeholder/40/40' },
        { id: 3, name: 'Mariah Maclachlan', type: 'Gym', date: '05/04/2025', duration: '3 months', status: 'rejected', description: 'Gym training with coach support', thumbnail: '/api/placeholder/40/40' },
        { id: 4, name: 'Val Head', type: 'Cycling', date: '15/07/2023', duration: '1 month', status: 'accepted', description: 'Cycling adventure challenge', thumbnail: '/api/placeholder/40/40' },
        { id: 5, name: 'Bill Fisher', type: 'Yoga', date: '20/11/2024', duration: '2 weeks', status: 'waiting', description: 'Yoga for flexibility and mindfulness', thumbnail: '/api/placeholder/40/40' },
        { id: 6, name: 'Jared Erondu', type: 'Swimming', date: '09/09/2022', duration: '4 months', status: 'accepted', description: 'Swimming endurance program', thumbnail: '/api/placeholder/40/40' },
        { id: 7, name: 'Zara Ali', type: 'Running', date: '22/12/2023', duration: '1 year', status: 'rejected', description: 'Marathon training program', thumbnail: '/api/placeholder/40/40' },
        { id: 8, name: 'Liam Nguyen', type: 'Workout', date: '03/03/2025', duration: '3 months', status: 'waiting', description: 'Full body workout series', thumbnail: '/api/placeholder/40/40' },
        { id: 9, name: 'Emma Johansson', type: 'Gym', date: '18/05/2024', duration: '6 months', status: 'accepted', description: 'Strength building program', thumbnail: '/api/placeholder/40/40' },
        { id: 10, name: 'Noah Kim', type: 'Yoga', date: '25/06/2024', duration: '2 months', status: 'accepted', description: 'Advanced yoga techniques', thumbnail: '/api/placeholder/40/40' },
        { id: 11, name: 'Olivia Smith', type: 'Cycling', date: '14/08/2023', duration: '1 month', status: 'waiting', description: 'City cycling challenge', thumbnail: '/api/placeholder/40/40' },
        { id: 12, name: 'William Chen', type: 'Swimming', date: '02/02/2025', duration: '5 months', status: 'rejected', description: 'Swimming techniques workshop', thumbnail: '/api/placeholder/40/40' },
        { id: 13, name: 'Sophia Brown', type: 'Running', date: '12/11/2022', duration: '2 weeks', status: 'accepted', description: 'Sprint training program', thumbnail: '/api/placeholder/40/40' },
        { id: 14, name: 'Mason Lee', type: 'Workout', date: '27/10/2024', duration: '4 months', status: 'waiting', description: 'Core strength exercises', thumbnail: '/api/placeholder/40/40' },
        { id: 15, name: 'Isabella Davis', type: 'Gym', date: '19/03/2025', duration: '3 months', status: 'accepted', description: 'Weight lifting basics', thumbnail: '/api/placeholder/40/40' },
        { id: 16, name: 'James Wilson', type: 'Yoga', date: '30/09/2023', duration: '1 year', status: 'rejected', description: 'Meditation and mindfulness', thumbnail: '/api/placeholder/40/40' },
        { id: 17, name: 'Ava Garcia', type: 'Cycling', date: '06/06/2024', duration: '6 months', status: 'accepted', description: 'Mountain biking adventure', thumbnail: '/api/placeholder/40/40' },
        { id: 18, name: 'Lucas Martinez', type: 'Swimming', date: '11/01/2023', duration: '2 months', status: 'waiting', description: 'Competitive swimming training', thumbnail: '/api/placeholder/40/40' },
        { id: 19, name: 'Mia Hernandez', type: 'Running', date: '08/08/2024', duration: '3 months', status: 'accepted', description: 'Trail running experience', thumbnail: '/api/placeholder/40/40' },
        { id: 20, name: 'Ethan Robinson', type: 'Workout', date: '17/05/2025', duration: '4 months', status: 'rejected', description: 'Home workout challenge', thumbnail: '/api/placeholder/40/40' },
    ];

    const [filterStatus, setFilterStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [challenges, setChallenges] = useState(allChallenges);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const challengesPerPage = 10;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    const [selectedChallenge, setSelectedChallenge] = useState(null);

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new field and reset to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const navigateToChallengeDetail = (challenge) => {
        navigate(`/challenge/${challenge.id}`);
    };

    // Toggle challenge status (active/inactive)
    const toggleChallengeStatus = (challengeId, currentStatus) => {
        const newStatus = currentStatus === "accepted" ? "rejected" : "accepted";

        // Update the status in the state
        const updatedChallenges = challenges.map(challenge => {
            if (challenge.id === challengeId) {
                return {
                    ...challenge,
                    status: newStatus
                };
            }
            return challenge;
        });

        setChallenges(updatedChallenges);

        // If the modal is open and showing this challenge, update its status too
        if (selectedChallenge && selectedChallenge.id === challengeId) {
            setSelectedChallenge({
                ...selectedChallenge,
                status: newStatus
            });
        }

        alert(`Challenge #${challengeId} status updated to ${newStatus}`);
    };

    // Handle action buttons for waiting challenges
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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSubmittedSearchTerm(searchTerm);
        }, 3000); // 3000 ms = 3 giây

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Filter, sort, and search challenges
    useEffect(() => {
        setIsLoading(true);
        try {
            let result = [...allChallenges];

            // Lọc theo filterStatus nếu có
            if (filterStatus) {
                result = result.filter(challenge => challenge.status === filterStatus);
            }

            // Lọc theo search term đã submit (sau khi debounce 3 giây)
            if (submittedSearchTerm) {
                const term = submittedSearchTerm.toLowerCase();
                result = result.filter(challenge =>
                    challenge.name.toLowerCase().includes(term) ||
                    challenge.type.toLowerCase().includes(term)
                );
            }

            // Sắp xếp nếu có sortField
            if (sortField) {
                result.sort((a, b) => {
                    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
                    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            setChallenges(result);
            setCurrentPage(1); // Reset trang về trang đầu khi thay đổi bộ lọc
            setIsLoading(false);
        } catch (error) {
            console.error('Error filtering challenges:', error);
            setIsError(true);
            setIsLoading(false);
        }
    }, [filterStatus, submittedSearchTerm, sortField, sortDirection]);




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
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Collapsible */}
                <div className={`transition-all duration-300  ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}/>
                </div>
            {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto p-4">
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                            <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                                <h1 className="text-2xl font-bold text-orange-600 mb-4">
                                    Quản lý thử thách
                                </h1>
                                <div className="flex flex-col md:flex-row gap-3 justify-between">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm theo tên hoặc email..."
                                            className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                                            <Search className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={toggleStatusDropdown}
                                            className="flex items-center space-x-2 bg-white border border-orange-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                  <span>
                    {filterStatus
                        ? `Trạng thái: ${filterStatus}`
                        : "Lọc theo trạng thái"}
                  </span>
                                            <ChevronDown className="h-5 w-5 text-orange-500" />
                                        </button>
                                        {isStatusDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-orange-100">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleStatusFilter(null)}
                                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                                    >
                                                        Tất cả
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusFilter("accepted")}
                                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                                    >
                                                        Đã chấp nhận
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusFilter("waiting")}
                                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                                    >
                                                        Đang chờ
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusFilter("rejected")}
                                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50"
                                                    >
                                                        Đã từ chối
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                    </div>
                                ) : isError ? (
                                    <div className="flex justify-center items-center h-64 text-red-500">
                                        <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-orange-100 to-yellow-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-orange-800">
                                                <button
                                                    className="flex items-center"
                                                    onClick={() => handleSort("name")}
                                                >
                                                    Tên thử thách
                                                    {sortField === "name" && (
                                                        <span className="ml-1 text-orange-500">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                                                    )}
                                                </button>
                                            </th>
                                            <th className="p-4 text-left font-bold text-orange-800 hidden md:table-cell">
                                                Mô tả
                                            </th>
                                            <th className="p-4 text-left font-bold text-orange-800">
                                                <button
                                                    className="flex items-center"
                                                    onClick={() => handleSort("status")}
                                                >
                                                    Trạng thái
                                                    {sortField === "status" && (
                                                        <span className="ml-1 text-orange-500">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                                                    )}
                                                </button>
                                            </th>
                                            <th className="p-4 text-left font-bold text-orange-800">
                                                Thao tác
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentChallenges.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="p-4 text-center text-gray-500"
                                                >
                                                    Không có thử thách nào phù hợp với tìm kiếm của bạn.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentChallenges.map((challenge) => (
                                                <tr
                                                    key={challenge.id}
                                                    className="border-b border-orange-50 hover:bg-orange-50 transition-colors"
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                                                                <img
                                                                    src={challenge.thumbnail}
                                                                    alt={challenge.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <span
                                                                className="font-medium text-orange-600 hover:text-orange-800 cursor-pointer hover:underline"
                                                                onClick={() => navigateToChallengeDetail(challenge)}
                                                            >
                              {challenge.name}
                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell text-gray-600">
                                                        {challenge.description}
                                                    </td>
                                                    <td className="p-4">
                                                        {challenge.status === "rejected" ||
                                                        challenge.status === "inactive" ? (
                                                            <div className="flex items-center text-red-500">
                                                                <XCircle className="mr-2 h-5 w-5" />
                                                                <span className="text-sm font-medium">
                                {challenge.status === "rejected"
                                    ? "Đã từ chối"
                                    : "Không hoạt động"}
                              </span>
                                                            </div>
                                                        ) : challenge.status === "waiting" ? (
                                                            <div className="flex items-center text-yellow-500">
                                                                <span className="mr-2 h-5 w-5">⏳</span>
                                                                <span className="text-sm font-medium">
                                Đang chờ
                              </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-green-500">
                                                                <CheckCircle className="mr-2 h-5 w-5" />
                                                                <span className="text-sm font-medium">
                                {challenge.status === "accepted"
                                    ? "Đã chấp nhận"
                                    : "Hoạt động"}
                              </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex space-x-2">
                                                            {challenge.status === "waiting" ? (
                                                                <>
                                                                    <button
                                                                        className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                                                                        onClick={() =>
                                                                            handleAction(challenge.id, "confirmed")
                                                                        }
                                                                    >
                                                                        <CheckCircle className="h-5 w-5" />
                                                                    </button>
                                                                    <button
                                                                        className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                                        onClick={() =>
                                                                            handleAction(challenge.id, "rejected")
                                                                        }
                                                                    >
                                                                        <XCircle className="h-5 w-5" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    className={`p-2 ${
                                                                        challenge.status === "accepted"
                                                                            ? "bg-red-100 text-red-600"
                                                                            : "bg-green-100 text-green-600"
                                                                    } rounded-md hover:${
                                                                        challenge.status === "accepted"
                                                                            ? "bg-red-200"
                                                                            : "bg-green-200"
                                                                    } transition-colors`}
                                                                    onClick={() =>
                                                                        toggleChallengeStatus(
                                                                            challenge.id,
                                                                            challenge.status
                                                                        )
                                                                    }
                                                                >
                                                                    {challenge.status === "accepted" ? (
                                                                        <XCircle className="h-5 w-5" />
                                                                    ) : (
                                                                        <CheckCircle className="h-5 w-5" />
                                                                    )}
                                                                </button>
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
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-orange-100 gap-4">
                                <div className="text-gray-600">
                                    Hiển thị{" "}
                                    <span className="font-medium">
                {currentChallenges.length > 0 ? indexOfFirstChallenge + 1 : 0}
              </span>{" "}
                                    đến{" "}
                                    <span className="font-medium">
                {indexOfFirstChallenge + currentChallenges.length}
              </span>{" "}
                                    trong tổng số{" "}
                                    <span className="font-medium">{challenges.length}</span> thử thách
                                </div>
                                <div className="flex space-x-2 self-center md:self-auto">
                                    <button
                                        className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                    </button>
                                    <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                <span className="text-orange-600 font-medium">
                  {currentPage}
                </span>
                                        <span className="mx-1 text-gray-400">/</span>
                                        <span className="text-gray-600">{totalPages}</span>
                                    </div>
                                    <button
                                        className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Footer */}
            <footer className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-4 text-white text-center">
                <p>© 2025 GoBeyond</p>
            </footer>
        </div>
    );
};

export default ChallengeList;