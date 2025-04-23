import React, { useState, useEffect } from 'react';
import { Star, Search, User, Users, Trophy } from 'lucide-react';
import { useTranslation } from "react-i18next";
import Achievement from "../member/Achievement.jsx"; // Import Achievement component

const GlobalLeaderboard = () => {
    const { t } = useTranslation();

    // Tab state
    const [activeTab, setActiveTab] = useState('individual');

    // State management for individual tab
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showUserRank, setShowUserRank] = useState(false);
    const usersPerPage = 10;

    // Mock data for individual rankings
    const individualUsers = [
        { id: 1, name: 'Eiden', username: '@username', score: 2430, avatar: '/api/placeholder/100/100', rank: 1 },
        { id: 2, name: 'Jackson', username: '@username', score: 1847, avatar: '/api/placeholder/100/100', rank: 2 },
        { id: 3, name: 'Emma Aria', username: '@username', score: 1674, avatar: '/api/placeholder/100/100', rank: 3 },
        { id: 4, name: 'Sebastian', username: '@username', score: 1300, avatar: '/api/placeholder/100/100', rank: 4 },
        { id: 5, name: 'Oliver', username: '@username', score: 1124, avatar: '/api/placeholder/100/100', rank: 5 },
        { id: 6, name: 'Sophia', username: '@username', score: 1120, avatar: '/api/placeholder/100/100', rank: 6 },
        { id: 7, name: 'Lucas', username: '@username', score: 1080, avatar: '/api/placeholder/100/100', rank: 7 },
        { id: 8, name: 'Isabella', username: '@username', score: 1040, avatar: '/api/placeholder/100/100', rank: 8 },
        { id: 9, name: 'William', username: '@username', score: 990, avatar: '/api/placeholder/100/100', rank: 9 },
        { id: 10, name: 'Mia', username: '@username', score: 950, avatar: '/api/placeholder/100/100', rank: 10 },
        { id: 11, name: 'James', username: '@username', score: 920, avatar: '/api/placeholder/100/100', rank: 11 },
        { id: 12, name: 'Charlotte', username: '@username', score: 900, avatar: '/api/placeholder/100/100', rank: 12 },
        { id: 13, name: 'Benjamin', username: '@username', score: 899, avatar: '/api/placeholder/100/100', rank: 13 },
        { id: 14, name: 'Amelia', username: '@username', score: 890, avatar: '/api/placeholder/100/100', rank: 14 },
        { id: 15, name: 'Elijah', username: '@username', score: 885, avatar: '/api/placeholder/100/100', rank: 15 },
        { id: 16, name: 'Harper', username: '@username', score: 880, avatar: '/api/placeholder/100/100', rank: 16 },
        { id: 17, name: 'Henry', username: '@username', score: 875, avatar: '/api/placeholder/100/100', rank: 17 },
        { id: 18, name: 'Evelyn', username: '@username', score: 870, avatar: '/api/placeholder/100/100', rank: 18 },
        { id: 19, name: 'Alexander', username: '@username', score: 865, avatar: '/api/placeholder/100/100', rank: 19 },
        { id: 20, name: 'Abigail', username: '@username', score: 860, avatar: '/api/placeholder/100/100', rank: 20 },
        { id: 21, name: 'Michael', username: '@username', score: 855, avatar: '/api/placeholder/100/100', rank: 21 },
        { id: 22, name: 'Elizabeth', username: '@username', score: 850, avatar: '/api/placeholder/100/100', rank: 22 },
        { id: 103, name: 'You', username: '@username', score: 799, avatar: '/api/placeholder/100/100', rank: 103, isCurrentUser: true },
        { id: 104, name: 'David', username: '@username', score: 649, avatar: '/api/placeholder/100/100', rank: 104 },
        { id: 105, name: 'Grace', username: '@username', score: 640, avatar: '/api/placeholder/100/100', rank: 105 }
    ];

    // Mock data for group rankings
    const groupRankings = [
        { id: 1, name: 'Team Avengers', members: 12, score: 8750, avatar: '/api/placeholder/100/100', rank: 1 },
        { id: 2, name: 'Tech Titans', members: 8, score: 7200, avatar: '/api/placeholder/100/100', rank: 2 },
        { id: 3, name: 'Digital Nomads', members: 15, score: 6450, avatar: '/api/placeholder/100/100', rank: 3 },
        { id: 4, name: 'Code Crushers', members: 10, score: 5800, avatar: '/api/placeholder/100/100', rank: 4 },
        { id: 5, name: 'Pixel Pioneers', members: 7, score: 5200, avatar: '/api/placeholder/100/100', rank: 5 },
        { id: 6, name: 'Data Dragons', members: 9, score: 4950, avatar: '/api/placeholder/100/100', rank: 6 },
        { id: 7, name: 'Quantum Quokkas', members: 11, score: 4700, avatar: '/api/placeholder/100/100', rank: 7 },
        { id: 8, name: 'Binary Beasts', members: 6, score: 4350, avatar: '/api/placeholder/100/100', rank: 8 },
        { id: 9, name: 'Cloud Champions', members: 14, score: 4100, avatar: '/api/placeholder/100/100', rank: 9 },
        { id: 10, name: 'Neural Networks', members: 8, score: 3850, avatar: '/api/placeholder/100/100', rank: 10 },
        { id: 11, name: 'Cyber Sentinels', members: 12, score: 3600, avatar: '/api/placeholder/100/100', rank: 11 },
        { id: 12, name: 'Algorithm Aces', members: 9, score: 3450, avatar: '/api/placeholder/100/100', rank: 12 },
        { id: 25, name: 'Your Team', members: 7, score: 2800, avatar: '/api/placeholder/100/100', rank: 25, isCurrentUser: true },
    ];

    // State management
    const [users, setUsers] = useState(individualUsers);
    const [displayUsers, setDisplayUsers] = useState([]);
    const [groups, setGroups] = useState(groupRankings);
    const [displayGroups, setDisplayGroups] = useState([]);

    const totalIndividualPages = Math.ceil(users.length / usersPerPage);
    const totalGroupPages = Math.ceil(groups.length / usersPerPage);
    const currentUser = users.find(user => user.isCurrentUser);
    const currentGroup = groups.find(group => group.isCurrentUser);

    // Handle search input change
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (activeTab === 'individual') {
            if (term) {
                const filtered = individualUsers.filter(user =>
                    user.name.toLowerCase().includes(term) ||
                    user.username.toLowerCase().includes(term)
                );
                setUsers(filtered);
                setCurrentPage(1);
            } else {
                setUsers(individualUsers);
            }
        } else if (activeTab === 'group') {
            if (term) {
                const filtered = groupRankings.filter(group =>
                    group.name.toLowerCase().includes(term)
                );
                setGroups(filtered);
                setCurrentPage(1);
            } else {
                setGroups(groupRankings);
            }
        }
    };

    // Go to current user's page or group's page
    const goToMyRank = () => {
        if (activeTab === 'individual' && currentUser) {
            // Calculate which page the current user is on
            const userPage = Math.ceil(currentUser.rank / usersPerPage);
            setCurrentPage(userPage);
            setShowUserRank(true);
            // Reset search term as we're navigating based on rank
            setSearchTerm('');
            setUsers(individualUsers);
        } else if (activeTab === 'group' && currentGroup) {
            // Calculate which page the current group is on
            const groupPage = Math.ceil(currentGroup.rank / usersPerPage);
            setCurrentPage(groupPage);
            setShowUserRank(true);
            // Reset search term as we're navigating based on rank
            setSearchTerm('');
            setGroups(groupRankings);
        }
    };

    // Tab switching logic
    useEffect(() => {
        // Reset pagination and search when switching tabs
        setCurrentPage(1);
        setSearchTerm('');

        if (activeTab === 'individual') {
            setUsers(individualUsers);
        } else if (activeTab === 'group') {
            setGroups(groupRankings);
        }
    }, [activeTab]);

    // Pagination logic for individual tab
    useEffect(() => {
        if (activeTab === 'individual') {
            // Get top 3 users for the top podium
            const top3 = individualUsers.filter(user => user.rank <= 3);

            // Get current users for the page
            const indexOfLastUser = currentPage * usersPerPage;
            const indexOfFirstUser = indexOfLastUser - usersPerPage;

            // If showing user rank, make sure to include the current user's section
            if (showUserRank && currentUser) {
                const userPage = Math.ceil(currentUser.rank / usersPerPage);

                if (userPage === currentPage) {
                    // Just show the regular page that includes the user
                    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
                    setDisplayUsers([...top3, ...currentUsers]);
                } else {
                    // We're on a different page, so we need to add the user's context
                    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

                    // Get users around the current user for context
                    const userIndex = users.findIndex(user => user.isCurrentUser);
                    const contextStart = Math.max(0, userIndex - 1);
                    const contextEnd = Math.min(users.length, userIndex + 2);
                    const userContext = users.slice(contextStart, contextEnd);

                    setDisplayUsers([...top3, ...currentUsers, ...userContext]);
                }
            } else {
                // Regular pagination without focusing on user rank
                const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
                setDisplayUsers([...top3, ...currentUsers]);
            }
        } else if (activeTab === 'group') {
            // Similar logic for groups
            const top3 = groupRankings.filter(group => group.rank <= 3);

            // Get current groups for the page
            const indexOfLastGroup = currentPage * usersPerPage;
            const indexOfFirstGroup = indexOfLastGroup - usersPerPage;

            // If showing user rank, make sure to include the current group's section
            if (showUserRank && currentGroup) {
                const groupPage = Math.ceil(currentGroup.rank / usersPerPage);

                if (groupPage === currentPage) {
                    // Just show the regular page that includes the group
                    const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup);
                    setDisplayGroups([...top3, ...currentGroups]);
                } else {
                    // We're on a different page, so we need to add the group's context
                    const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup);

                    // Get groups around the current group for context
                    const groupIndex = groups.findIndex(group => group.isCurrentUser);
                    const contextStart = Math.max(0, groupIndex - 1);
                    const contextEnd = Math.min(groups.length, groupIndex + 2);
                    const groupContext = groups.slice(contextStart, contextEnd);

                    setDisplayGroups([...top3, ...currentGroups, ...groupContext]);
                }
            } else {
                // Regular pagination without focusing on group rank
                const currentGroups = groups.slice(indexOfFirstGroup, indexOfLastGroup);
                setDisplayGroups([...top3, ...currentGroups]);
            }
        }

        // Reset showUserRank after applying it once
        if (showUserRank) setShowUserRank(false);
    }, [currentPage, users, groups, showUserRank, activeTab]);

    // Pagination controls
    const paginate = (pageNumber) => {
        const totalPages = activeTab === 'individual' ? totalIndividualPages : totalGroupPages;
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Get top 3 for podium display based on active tab
    const getTop3 = () => {
        if (activeTab === 'individual') {
            return individualUsers.filter(user => user.rank <= 3).sort((a, b) => a.rank - b.rank);
        } else if (activeTab === 'group') {
            return groupRankings.filter(group => group.rank <= 3).sort((a, b) => a.rank - b.rank);
        }
        return [];
    };

    const top3 = getTop3();
    // Make sure we have exactly 3 items in correct order
    while (top3.length < 3) {
        top3.push(null); // Fill with nulls if we don't have enough top entries
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="w-full flex mb-8 gap-2">
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`flex-1 py-3 rounded-t-lg font-semibold flex items-center justify-center gap-2 ${
                            activeTab === 'individual'
                                ? 'bg-blue-700 text-white border-b-2 border-blue-400'
                                : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                        }`}
                    >
                        <User size={18} />
                        {t('leaderboard.individual')}
                    </button>
                    <button
                        onClick={() => setActiveTab('group')}
                        className={`flex-1 py-3 rounded-t-lg font-semibold flex items-center justify-center gap-2 ${
                            activeTab === 'group'
                                ? 'bg-blue-700 text-white border-b-2 border-blue-400'
                                : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                        }`}
                    >
                        <Users size={18} />
                        {t('leaderboard.group')}
                    </button>
                    <button
                        onClick={() => setActiveTab('achievement')}
                        className={`flex-1 py-3 rounded-t-lg font-semibold flex items-center justify-center gap-2 ${
                            activeTab === 'achievement'
                                ? 'bg-blue-700 text-white border-b-2 border-blue-400'
                                : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                        }`}
                    >
                        <Trophy size={18} />
                        {t('leaderboard.achievements')}
                    </button>
                </div>

                {/* Individual and Group Tabs Content */}
                {(activeTab === 'individual' || activeTab === 'group') && (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Top 3 Users/Groups */}
                        <div className="lg:w-1/3 flex flex-col justify-center">
                            <div className="bg-white bg-opacity-20 p-6 rounded-xl mb-6">
                                <h2 className="text-2xl font-bold mb-6 text-center text-blue-300">Top 3</h2>

                                {/* First Place */}
                                {top3[0] && (
                                    <div className="flex flex-col items-center mb-8 relative">
                                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                            <svg className="w-12 h-12 text-yellow-400" viewBox="0 0 100 100">
                                                <path fill="currentColor" d="M50 0 L65 35 L100 35 L70 55 L80 90 L50 70 L20 90 L30 55 L0 35 L35 35 Z" />
                                            </svg>
                                        </div>
                                        <div className="rounded-full overflow-hidden border-4 border-yellow-400 w-28 h-28 mb-2 bg-orange-500">
                                            <img src={top3[0]?.avatar} alt={top3[0]?.name} className="w-full h-full object-cover bg-yellow-900" />
                                        </div>
                                        <div className="bg-yellow-900 rounded-full w-8 h-8 flex items-center justify-center mb-1">
                                            <span className="font-bold">1</span>
                                        </div>
                                        <p className="font-bold text-xl">{top3[0]?.name}</p>
                                        <p className="text-yellow-400 text-3xl font-bold">{top3[0]?.score}</p>
                                        {activeTab === 'individual' ? (
                                            <p className="text-gray-400 text-sm">{top3[0]?.username}</p>
                                        ) : (
                                            <p className="text-gray-400 text-sm">{top3[0]?.members} members</p>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-center">
                                    {/* Second Place */}
                                    {top3[1] && (
                                        <div className="flex flex-col items-center mx-4">
                                            <div className="rounded-full overflow-hidden border-4 border-blue-400 w-20 h-20 mb-2 bg-blue-500">
                                                <img src={top3[1]?.avatar} alt={top3[1]?.name} className="w-full h-full object-cover bg-blue-900" />
                                            </div>
                                            <div className="bg-blue-900 rounded-full w-7 h-7 flex items-center justify-center mb-1">
                                                <span className="font-bold">2</span>
                                            </div>
                                            <p className="font-bold text-lg">{top3[1]?.name}</p>
                                            <p className="text-blue-400 text-2xl font-bold">{top3[1]?.score}</p>
                                            {activeTab === 'individual' ? (
                                                <p className="text-gray-400 text-sm">{top3[1]?.username}</p>
                                            ) : (
                                                <p className="text-gray-400 text-sm">{top3[1]?.members} members</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Third Place */}
                                    {top3[2] && (
                                        <div className="flex flex-col items-center mx-4">
                                            <div className="rounded-full overflow-hidden border-4 border-green-400 w-20 h-20 mb-2 bg-green-600">
                                                <img src={top3[2]?.avatar} alt={top3[2]?.name} className="w-full h-full object-cover bg-green-900" />
                                            </div>
                                            <div className="bg-green-900 rounded-full w-7 h-7 flex items-center justify-center mb-1">
                                                <span className="font-bold">3</span>
                                            </div>
                                            <p className="font-bold text-lg">{top3[2]?.name}</p>
                                            <p className="text-green-400 text-2xl font-bold">{top3[2]?.score}</p>
                                            {activeTab === 'individual' ? (
                                                <p className="text-gray-400 text-sm">{top3[2]?.username}</p>
                                            ) : (
                                                <p className="text-gray-400 text-sm">{top3[2]?.members} members</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Search and List */}
                        <div className="lg:w-2/3 ">
                            {/* Search and My Rank Controls */}
                            <div className="flex mb-6 gap-4">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('leaderboard.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="w-full py-2 pl-10 pr-4 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={goToMyRank}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    {activeTab === 'individual' ? <User size={18} /> : <Users size={18} />}
                                    {activeTab === 'individual' ? t('leaderboard.myRank') : t('leaderboard.myGroupRank')}
                                </button>
                            </div>

                            {/* Rest of Leaderboard */}
                            <div className="mb-6 bg-black bg-opacity-20 ">
                                {/* Column Headers */}
                                <div className="flex items-center w-full p-3 border-b border-blue-800 bg-blue-900 bg-opacity-40 font-semibold text-amber-50">
                                    <div className="w-12 text-center">#</div>
                                    <div className="flex-1">{activeTab === 'individual' ? t('leaderboard.user') : t('leaderboard.group')}</div>
                                    {activeTab === 'group' && <div className="w-32 text-center mr-4">{t('leaderboard.members')}</div>}
                                    <div className="w-32 text-right">{t('leaderboard.score')}</div>
                                </div>

                                {/* User/Group Rows - Paginated */}
                                {activeTab === 'individual' ? (
                                    users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((user) => (
                                        <div
                                            key={user.id}
                                            className={`flex items-center w-full p-3 border-b border-blue-900 text-amber-50 ${user.isCurrentUser ? 'bg-blue-900 bg-opacity-30' : ''}`}
                                        >
                                            {/* User rank */}
                                            <div className="w-12 text-center font-bold text-lg">
                                                {user.isCurrentUser && (
                                                    <Star className="inline-block text-yellow-400 mr-1" size={16} />
                                                )}
                                                {user.rank}
                                            </div>

                                            {/* User avatar and info */}
                                            <div className="flex items-center flex-1">
                                                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-600">
                                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{user.name}</div>
                                                    <div className="text-gray-400 text-sm">{user.username}</div>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className={`text-right font-bold text-xl ${user.isCurrentUser ? 'text-yellow-300' : 'text-white'}`}>
                                                {user.score}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    groups.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((group) => (
                                        <div
                                            key={group.id}
                                            className={`flex items-center w-full p-3 border-b border-blue-900 text-amber-50 ${group.isCurrentUser ? 'bg-blue-900 bg-opacity-30' : ''}`}
                                        >
                                            {/* Group rank */}
                                            <div className="w-12 text-center font-bold text-lg">
                                                {group.isCurrentUser && (
                                                    <Star className="inline-block text-yellow-400 mr-1" size={16} />
                                                )}
                                                {group.rank}
                                            </div>

                                            {/* Group avatar and info */}
                                            <div className="flex items-center flex-1">
                                                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-600">
                                                    <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{group.name}</div>
                                                </div>
                                            </div>

                                            {/* Members count */}
                                            <div className="w-32 text-center mr-4">
                                                <span className="bg-blue-800 px-2 py-1 rounded-full text-xs text-gray-400">
                                                    {group.members} {t('leaderboard.members')}
                                                </span>
                                            </div>


                                            {/* Score */}
                                            <div className="w-32 text-right font-bold text-xl ${group.isCurrentUser ? 'text-yellow-300' : 'text-white'}">
                                                {group.score}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg ${
                                        currentPage === 1 ? 'bg-blue-900 text-blue-700 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'
                                    }`}
                                >
                                    {t('leaderboard.previous')}
                                </button>
                                <div>
                                    {t('leaderboard.page')} {currentPage} {t('leaderboard.of')} {activeTab === 'individual' ? totalIndividualPages : totalGroupPages}
                                </div>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={
                                        currentPage === (activeTab === 'individual' ? totalIndividualPages : totalGroupPages)
                                    }
                                    className={`px-4 py-2 rounded-lg ${
                                        currentPage === (activeTab === 'individual' ? totalIndividualPages : totalGroupPages)
                                            ? 'bg-blue-900 text-blue-700 cursor-not-allowed'
                                            : 'bg-blue-700 hover:bg-blue-600'
                                    }`}
                                >
                                    {t('leaderboard.next')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Achievements Tab Content */}
                {activeTab === 'achievement' && (
                    <Achievement />
                )}
            </div>
        </div>
    );
};

export default GlobalLeaderboard;