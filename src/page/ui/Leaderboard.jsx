import  { useState } from 'react';
import { Star } from 'lucide-react';

const GlobalLeaderboard = () => {
    // Mock data - in a real app this would come from an API
    const [users, setUsers] = useState([
        { id: 1, name: 'Eiden', username: '@username', score: 2430, avatar: '/api/placeholder/100/100', rank: 1 },
        { id: 2, name: 'Jackson', username: '@username', score: 1847, avatar: '/api/placeholder/100/100', rank: 2 },
        { id: 3, name: 'Emma Aria', username: '@username', score: 1674, avatar: '/api/placeholder/100/100', rank: 3 },
        { id: 4, name: 'Sebastian', username: '@username', score: 1300, avatar: '/api/placeholder/100/100', rank: 4 },
        { id: 5, name: 'Sebastian', username: '@username', score: 1124, avatar: '/api/placeholder/100/100', rank: 5 },
        { id: 6, name: 'Sebastian', username: '@username', score: 1120, avatar: '/api/placeholder/100/100', rank: 6 },
        // Skip some ranks to demonstrate the layout
        { id: 7, name: 'Sebastian', username: '@username', score: 900, avatar: '/api/placeholder/100/100', rank: 101 },
        { id: 8, name: 'Sebastian', username: '@username', score: 850, avatar: '/api/placeholder/100/100', rank: 102 },
        { id: 9, name: 'You', username: '@username', score: 799, avatar: '/api/placeholder/100/100', rank: 103, isCurrentUser: true },
        { id: 10, name: 'Sebastian', username: '@username', score: 649, avatar: '/api/placeholder/100/100', rank: 104 }
    ]);

    // Get top 3 users and the rest of the list
    const top3 = users.filter(user => user.rank <= 3);
    const restOfList = users.filter(user => user.rank > 3);

    // Get the user's rank color based on position
    const getRankColor = (rank) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-blue-400';
        if (rank === 3) return 'text-green-400';
        return 'text-white';
    };

    // Get the user's score color based on position
    const getScoreColor = (rank) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-blue-400';
        if (rank === 3) return 'text-green-400';
        return 'text-white';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 to-indigo-950 text-white flex flex-col items-center py-8">
            {/* Header */}
            <h1 className="text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">GoBeyond</h1>

            {/* Top 3 Users */}
            <div className="flex justify-center items-end mb-12 relative w-full max-w-2xl">
                {/* Second Place */}
                <div className="flex flex-col items-center mx-4 z-10">
                    <div className="rounded-full overflow-hidden border-4 border-blue-400 w-24 h-24 mb-2">
                        <img src={top3[1]?.avatar} alt={top3[1]?.name} className="w-full h-full object-cover bg-blue-900" />
                    </div>
                    <div className="bg-blue-900 rounded-full w-8 h-8 flex items-center justify-center mb-1">
                        <span className="font-bold">2</span>
                    </div>
                    <p className="font-bold text-lg">{top3[1]?.name}</p>
                    <p className="text-blue-400 text-2xl font-bold">{top3[1]?.score}</p>
                    <p className="text-gray-400 text-sm">{top3[1]?.username}</p>
                </div>

                {/* First Place */}
                <div className="flex flex-col items-center mx-4 z-20 relative">
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                        <svg className="w-16 h-16 text-yellow-400" viewBox="0 0 100 100">
                            <path fill="currentColor" d="M50 0 L65 35 L100 35 L70 55 L80 90 L50 70 L20 90 L30 55 L0 35 L35 35 Z" />
                        </svg>
                    </div>
                    <div className="rounded-full overflow-hidden border-4 border-yellow-400 w-32 h-32 mb-2">
                        <img src={top3[0]?.avatar} alt={top3[0]?.name} className="w-full h-full object-cover bg-yellow-900" />
                    </div>
                    <div className="bg-yellow-900 rounded-full w-8 h-8 flex items-center justify-center mb-1">
                        <span className="font-bold">1</span>
                    </div>
                    <p className="font-bold text-xl">{top3[0]?.name}</p>
                    <p className="text-yellow-400 text-3xl font-bold">{top3[0]?.score}</p>
                    <p className="text-gray-400 text-sm">{top3[0]?.username}</p>
                </div>

                {/* Third Place */}
                <div className="flex flex-col items-center mx-4 z-10">
                    <div className="rounded-full overflow-hidden border-4 border-green-400 w-24 h-24 mb-2">
                        <img src={top3[2]?.avatar} alt={top3[2]?.name} className="w-full h-full object-cover bg-green-900" />
                    </div>
                    <div className="bg-green-900 rounded-full w-8 h-8 flex items-center justify-center mb-1">
                        <span className="font-bold">3</span>
                    </div>
                    <p className="font-bold text-lg">{top3[2]?.name}</p>
                    <p className="text-green-400 text-2xl font-bold">{top3[2]?.score}</p>
                    <p className="text-gray-400 text-sm">{top3[2]?.username}</p>
                </div>
            </div>

            {/* Rest of Leaderboard */}
            <div className="w-full max-w-2xl">
                {/* Top positions (4-6) */}
                {restOfList.slice(0, 3).map((user) => (
                    <div
                        key={user.id}
                        className={`flex items-center w-full p-3 border-b border-blue-800 ${user.isCurrentUser ? 'bg-blue-900 bg-opacity-30' : ''}`}
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
                ))}

                {/* Ellipsis indicator */}
                <div className="flex items-center w-full p-3 border-b border-blue-800">
                    <div className="w-12 text-center font-bold text-2xl text-blue-400">•</div>
                    <div className="flex-1"></div>
                </div>
                <div className="flex items-center w-full p-3 border-b border-blue-800">
                    <div className="w-12 text-center font-bold text-2xl text-blue-400">•</div>
                    <div className="flex-1"></div>
                </div>
                <div className="flex items-center w-full p-3 border-b border-blue-800">
                    <div className="w-12 text-center font-bold text-2xl text-blue-400">•</div>
                    <div className="flex-1"></div>
                </div>

                {/* Bottom positions (101-104) */}
                {restOfList.slice(3).map((user) => (
                    <div
                        key={user.id}
                        className={`flex items-center w-full p-3 border-b border-blue-800 ${user.isCurrentUser ? 'bg-blue-900 bg-opacity-30' : ''}`}
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
                ))}
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 mt-12 text-sm">
                Copyright © 2023
            </div>
        </div>
    );
};

export default GlobalLeaderboard;