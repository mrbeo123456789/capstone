import React, { useState, useEffect } from 'react';
import { Star, Search, User, Users, Trophy } from 'lucide-react';
import { useTranslation } from "react-i18next";
import Achievement from "../member/Achievement.jsx";
import {
    useGetGlobalRankingQuery,
    useGetMyRankingQuery,
    useGetGlobalGroupRankingQuery
} from "../../service/rankingService.js";

const GlobalLeaderboard = () => {
    const { t } = useTranslation();

    // Tab state
    const [activeTab, setActiveTab] = useState('individual');

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // State for API pagination
    const [individualPage, setIndividualPage] = useState(0);
    const [groupPage, setGroupPage] = useState(0);
    const [groupKeyword, setGroupKeyword] = useState("");
    const [individualKeyword, setIndividualKeyword] = useState("");

    // Process individual and group ranking data
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [totalIndividualPages, setTotalIndividualPages] = useState(1);
    const [totalGroupPages, setTotalGroupPages] = useState(1);
    const [top3Items, setTop3Items] = useState([null, null, null]);

    // Fetch data from APIs
    const {
        data: globalRankingData,
        isLoading: isLoadingIndividual,
        error: individualError
    } = useGetGlobalRankingQuery({
        page: individualPage,
        size: usersPerPage,
        keyword: individualKeyword
    });

    // Fetch global group rankings
    const {
        data: globalGroupRankingData,
        isLoading: isLoadingGroupRanking,
        error: groupRankingError
    } = useGetGlobalGroupRankingQuery({
        keyword: groupKeyword,
        page: groupPage
    });

    // Fetch current user's ranking
    const {
        data: myRankingData,
        isLoading: isLoadingMyRanking
    } = useGetMyRankingQuery();

    // Process individual ranking data when it arrives
    useEffect(() => {
        if (globalRankingData) {
            // Process API response to match our component's data structure
            const processedUsers = globalRankingData.content.map((user, index) => ({
                id: user.id,
                name: user.name || user.username,
                username: `@${user.username}`,
                score: user.score,
                avatar: user.avatar || '/api/placeholder/100/100',
                rank: user.rank || index + 1 + (individualPage * usersPerPage),
                isCurrentUser: user.isCurrentUser || false
            }));

            setUsers(processedUsers);
            setTotalIndividualPages(globalRankingData.totalPages || 1);
        }
    }, [globalRankingData, individualPage]);

    // Process group ranking data when it arrives
    useEffect(() => {
        if (globalGroupRankingData) {
            // Process API response to match our component's data structure
            const processedGroups = globalGroupRankingData.content.map((group, index) => ({
                id: group.groupId,
                name: group.groupName,
                score: group.totalStars,
                avatar: group.groupPicture || '/api/placeholder/100/100',
                members: group.memberCount || 0, // Nếu có
                rank: index + 1 + (groupPage * usersPerPage),
            }));

            setGroups(processedGroups);
            setTotalGroupPages(globalGroupRankingData.totalPages || 1);
        }
    }, [globalGroupRankingData, groupPage]);

    // Handle search input change
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (activeTab === 'individual') {
            // Reset pagination when searching
            setIndividualKeyword(term);
            setIndividualPage(0);
            setCurrentPage(1);
            // API handles the search filter
        } else if (activeTab === 'group') {
            // Reset pagination when searching
            setGroupKeyword(term);
            setGroupPage(0);
            setCurrentPage(1);
            // API handles the search filter
        }
    };

    // Go to my rank when API is available
    const goToMyRank = () => {
        if (myRankingData && !isLoadingMyRanking) {
            const rank = myRankingData.rank;
            const apiPage = Math.floor((rank - 1) / usersPerPage);
            setIndividualPage(apiPage);
            setCurrentPage(apiPage + 1); // currentPage is 1-indexed for UI
        } else {
            // API not available yet
            alert(t('leaderboard.rankFeatureNotAvailable'));
        }
    };

    // Tab switching logic
    useEffect(() => {
        // Reset pagination and search when switching tabs
        setCurrentPage(1);
        setSearchTerm('');
        setIndividualPage(0);
        setGroupPage(0);
        setGroupKeyword('');
        setIndividualKeyword('');
    }, [activeTab]);

    // Handle API page fetching when current page changes
    useEffect(() => {
        if (activeTab === 'individual') {
            // Convert UI page (1-indexed) to API page (0-indexed)
            setIndividualPage(currentPage - 1);
        } else if (activeTab === 'group') {
            // Convert UI page (1-indexed) to API page (0-indexed)
            setGroupPage(currentPage - 1);
        }
    }, [currentPage, activeTab]);

    // Update top 3 items based on active tab
    useEffect(() => {
        let newTop3 = [null, null, null]; // Start with default empty array

        if (activeTab === 'individual') {
            // Use the first 3 users from global ranking
            const topUsers = users
                .filter(user => user.rank <= 3)
                .sort((a, b) => a.rank - b.rank);

            // Add available users to the new top3 array
            topUsers.forEach((user, idx) => {
                if (idx < 3) newTop3[idx] = user;
            });
        } else if (activeTab === 'group') {
            // Use the first 3 groups from global ranking
            const topGroups = groups
                .filter(group => group.rank <= 3)
                .sort((a, b) => a.rank - b.rank);

            // Add available groups to the new top3 array
            topGroups.forEach((group, idx) => {
                if (idx < 3) newTop3[idx] = group;
            });
        }

        setTop3Items(newTop3);
    }, [activeTab, users, groups]);

    // Pagination controls
    const paginate = (pageNumber) => {
        const totalPages = activeTab === 'individual' ? totalIndividualPages : totalGroupPages;
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

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

                                {(isLoadingIndividual && activeTab === 'individual') ||
                                (isLoadingGroupRanking && activeTab === 'group') ? (
                                    <div className="flex justify-center items-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* First Place */}
                                        {top3Items[0] && (
                                            <div className="flex flex-col items-center mb-8 relative">
                                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                                    <svg className="w-12 h-12 text-yellow-400" viewBox="0 0 100 100">
                                                        <path fill="currentColor" d="M50 0 L65 35 L100 35 L70 55 L80 90 L50 70 L20 90 L30 55 L0 35 L35 35 Z" />
                                                    </svg>
                                                </div>
                                                <div className="rounded-full overflow-hidden border-4 border-yellow-400 w-28 h-28 mb-2 bg-orange-500">
                                                    <img src={top3Items[0]?.avatar} alt={top3Items[0]?.name} className="w-full h-full object-cover bg-yellow-900" />
                                                </div>
                                                <div className="bg-yellow-900 rounded-full w-8 h-8 flex items-center justify-center mb-1">
                                                    <span className="font-bold">1</span>
                                                </div>
                                                <p className="font-bold text-xl">{top3Items[0]?.name}</p>
                                                <p className="text-yellow-400 text-3xl font-bold">{top3Items[0]?.score}</p>
                                                {activeTab === 'individual' ? (
                                                    <p className="text-gray-400 text-sm">{top3Items[0]?.username}</p>
                                                ) : (
                                                    <p className="text-gray-400 text-sm">{top3Items[0]?.members} members</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex justify-center">
                                            {/* Second Place */}
                                            {top3Items[1] && (
                                                <div className="flex flex-col items-center mx-4">
                                                    <div className="rounded-full overflow-hidden border-4 border-blue-400 w-20 h-20 mb-2 bg-blue-500">
                                                        <img src={top3Items[1]?.avatar} alt={top3Items[1]?.name} className="w-full h-full object-cover bg-blue-900" />
                                                    </div>
                                                    <div className="bg-blue-900 rounded-full w-7 h-7 flex items-center justify-center mb-1">
                                                        <span className="font-bold">2</span>
                                                    </div>
                                                    <p className="font-bold text-lg">{top3Items[1]?.name}</p>
                                                    <p className="text-blue-400 text-2xl font-bold">{top3Items[1]?.score}</p>
                                                    {activeTab === 'individual' ? (
                                                        <p className="text-gray-400 text-sm">{top3Items[1]?.username}</p>
                                                    ) : (
                                                        <p className="text-gray-400 text-sm">{top3Items[1]?.members} members</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Third Place */}
                                            {top3Items[2] && (
                                                <div className="flex flex-col items-center mx-4">
                                                    <div className="rounded-full overflow-hidden border-4 border-green-400 w-20 h-20 mb-2 bg-green-600">
                                                        <img src={top3Items[2]?.avatar} alt={top3Items[2]?.name} className="w-full h-full object-cover bg-green-900" />
                                                    </div>
                                                    <div className="bg-green-900 rounded-full w-7 h-7 flex items-center justify-center mb-1">
                                                        <span className="font-bold">3</span>
                                                    </div>
                                                    <p className="font-bold text-lg">{top3Items[2]?.name}</p>
                                                    <p className="text-green-400 text-2xl font-bold">{top3Items[2]?.score}</p>
                                                    {activeTab === 'individual' ? (
                                                        <p className="text-gray-400 text-sm">{top3Items[2]?.username}</p>
                                                    ) : (
                                                        <p className="text-gray-400 text-sm">{top3Items[2]?.members} members</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
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
                                {/* Only show "My Rank" button in individual tab */}
                                {activeTab === 'individual' && (
                                    <button
                                        onClick={goToMyRank}
                                        className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${
                                            isLoadingMyRanking || !myRankingData ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        disabled={isLoadingMyRanking || !myRankingData}
                                    >
                                        <User size={18} />
                                        {t('leaderboard.myRank')}
                                    </button>
                                )}
                            </div>

                            {/* Rest of Leaderboard */}
                            <div className="mb-6 bg-black bg-opacity-20">
                                {/* Column Headers */}
                                <div className="flex items-center w-full p-3 border-b border-blue-800 bg-blue-900 bg-opacity-40 font-semibold text-amber-50">
                                    <div className="w-12 text-center">#</div>
                                    <div className="flex-1">{activeTab === 'individual' ? t('leaderboard.user') : t('leaderboard.group')}</div>
                                    {activeTab === 'group' && <div className="w-32 text-center mr-4">{t('leaderboard.members')}</div>}
                                    <div className="w-32 text-right">{t('leaderboard.score')}</div>
                                </div>

                                {/* User/Group Rows - Paginated */}
                                {activeTab === 'individual' ? (
                                    isLoadingIndividual ? (
                                        <div className="flex justify-center items-center p-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : individualError ? (
                                        <div className="text-center p-8 text-red-400">
                                            Failed to load rankings. Please try again.
                                        </div>
                                    ) : users.length === 0 ? (
                                        <div className="text-center p-8 text-gray-400">
                                            No user rankings found.
                                        </div>
                                    ) : (
                                        users.map((user) => (
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
                                    )
                                ) : (
                                    isLoadingGroupRanking ? (
                                        <div className="flex justify-center items-center p-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : groupRankingError ? (
                                        <div className="text-center p-8 text-red-400">
                                            Failed to load group rankings. Please try again.
                                        </div>
                                    ) : groups.length === 0 ? (
                                        <div className="text-center p-8 text-gray-400">
                                            No group rankings found.
                                        </div>
                                    ) : (
                                        groups.map((group) => (
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
                                                <div className="w-32 text-right font-bold text-xl">
                                                    {group.score}
                                                </div>
                                            </div>
                                        ))
                                    )
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