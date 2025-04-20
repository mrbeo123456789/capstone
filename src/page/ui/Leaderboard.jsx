import React, { useState, useEffect } from 'react';
import { Search, Trophy, Star, Sparkles } from 'lucide-react';
import {
    useGetGlobalRankingQuery
} from '../../service/rankingService'; // adjust import path as needed

const ModernLeaderboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [animate, setAnimate] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Fetch global ranking from API
    const {
        data: rankingData = { content: [], totalPages: 1 },
        isLoading,
        error
    } = useGetGlobalRankingQuery({ page: currentPage - 1, size: pageSize });

    // animate on mount
    useEffect(() => {
        setAnimate(true);
        const timer = setTimeout(() => setAnimate(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // filter by search term
    const filtered = rankingData.content.filter((user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // compute absolute rank
    const withRank = filtered.map((user, idx) => ({
        ...user,
        rank: (currentPage - 1) * pageSize + idx + 1,
        score: user.totalStars
    }));

    // helpers for styling
    const getRankGradient = (rank) => {
        if (rank === 1) return 'from-yellow-300 to-amber-500';
        if (rank === 2) return 'from-blue-300 to-blue-500';
        if (rank === 3) return 'from-green-300 to-green-500';
        return 'from-purple-700 to-purple-900';
    };
    const getBorderColor = (rank) => {
        if (rank === 1) return 'border-yellow-400';
        if (rank === 2) return 'border-blue-400';
        if (rank === 3) return 'border-green-400';
        return 'border-gray-600';
    };
    const getScoreColor = (rank) => {
        if (rank === 1) return 'text-yellow-300';
        if (rank === 2) return 'text-blue-300';
        if (rank === 3) return 'text-green-300';
        return 'text-purple-300';
    };

    // separate top3 and the rest
    const top3 = withRank.slice(0, 3);
    const rest = withRank.slice(3);

    if (isLoading) {
        return <p className="text-center">Loading leaderboard…</p>;
    }
    if (error) {
        return <p className="text-center text-red-600">Error loading leaderboard</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4">
            {/* Background effects */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-64 bg-blue-500 opacity-5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"/>
                <div className="absolute bottom-0 right-0 w-full h-64 bg-purple-500 opacity-5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"/>
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 mt-8">
                    <div className="relative inline-block">
                        <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                            GoBeyond
                        </h1>
                        <div className="absolute -top-4 -right-8 text-yellow-300">
                            <Sparkles size={24} />
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative w-full max-w-md mx-auto mb-12 group">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full px-5 py-3 pl-12 rounded-full bg-gray-800 text-white border border-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all duration-300 shadow-lg"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-300">
                            <Search size={20} />
                        </div>
                    </div>

                    {/* Top 3 users */}
                    <div className="flex justify-center space-x-6 mb-16">
                        {top3.length > 0 ? top3.map((user, i) => (
                            <div
                                key={user.memberId}
                                className={`flex flex-col items-center ${
                                    i === 1 ? 'transform scale-110 transition-transform duration-700' : 'hover:scale-105 transition-transform duration-500'
                                }`}
                            >
                                <div className="relative mb-4">
                                    {i === 1 && (
                                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 text-yellow-400 animate-bounce">
                                            <Trophy size={36} />
                                        </div>
                                    )}
                                    <div
                                        className={`w-${i===1?32:24} h-${i===1?32:24} rounded-full overflow-hidden border-4 ${getBorderColor(user.rank)}
                                shadow-md transition-all duration-300`}
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${getRankGradient(user.rank)}
                              rounded-full w-8 h-8 flex items-center justify-center shadow-lg`}>
                                        <span className="text-xs font-bold">{user.rank}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className={`font-bold ${i===1?'text-xl':'text-lg'}`}>{user.fullName}</p>
                                    <p className={`${getScoreColor(user.rank)} font-black ${i===1?'text-3xl':'text-2xl'}`}>
                                        {user.score}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500">No ranking data</p>
                        )}
                    </div>

                    {/* Leaderboard table */}
                    <div className="w-full bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                        {rest.map((user) => (
                            <div
                                key={user.memberId}
                                className={`flex items-center w-full p-4 border-b border-gray-700 transition-all duration-300 hover:bg-gray-700 hover:bg-opacity-30`}
                            >
                                <div className="flex items-center w-full">
                                    <div className={`w-12 h-12 flex items-center justify-center`}>
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRankGradient(user.rank)}
                                   flex items-center justify-center text-white font-bold text-sm`}>
                                            {user.rank}
                                        </div>
                                    </div>
                                    <div className="flex items-center flex-1 ml-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-gray-600">
                                            <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{user.fullName}</div>
                                        </div>
                                    </div>
                                    <div className={`text-right font-bold text-lg ${getScoreColor(user.rank)}`}>
                                        {user.score}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-6 space-x-1">
                        {Array.from({ length: rankingData.totalPages }, (_, i) => (
                            <button
                                key={`page-${i+1}`}
                                onClick={() => setCurrentPage(i+1)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === i+1
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            >
                                {i+1}
                            </button>
                        ))}
                        {currentPage < rankingData.totalPages && (
                            <button
                                key="next-page"
                                onClick={() => setCurrentPage(currentPage+1)}
                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                                &gt;
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-500 mt-10 mb-6 text-sm">
                    Copyright © 2023
                </div>
            </div>
        </div>
    );
};

export default ModernLeaderboard;
