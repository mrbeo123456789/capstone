import React, { useState } from "react";
import { FaTrophy, FaMountain, FaBullseye } from "react-icons/fa";

const Achievement = () => {
    const achievements = [
        { icon: <FaTrophy className="text-5xl text-blue-500" />, title: "Winner", description: "Top performer in challenges.", unlocked: true },
        { icon: <FaMountain className="text-5xl text-purple-500" />, title: "Conqueror", description: "Completed the hardest challenges.", unlocked: true },
        { icon: <FaBullseye className="text-5xl text-indigo-500" />, title: "Sharpshooter", description: "Hit 100% goal accuracy.", unlocked: false },
        { icon: <FaTrophy className="text-5xl text-green-500" />, title: "Champion", description: "Won 10 group battles.", unlocked: false },
        { icon: <FaMountain className="text-5xl text-pink-500" />, title: "Trailblazer", description: "Created a challenge with 50+ members.", unlocked: true },
        { icon: <FaBullseye className="text-5xl text-yellow-500" />, title: "Goal Setter", description: "Completed 5 personal goals.", unlocked: false },
        { icon: <FaTrophy className="text-5xl text-blue-400" />, title: "Legend", description: "Achieved the highest system badge.", unlocked: false },
        { icon: <FaMountain className="text-5xl text-purple-400" />, title: "Explorer", description: "Joined challenges across all categories.", unlocked: true },
        { icon: <FaBullseye className="text-5xl text-indigo-400" />, title: "Focus Master", description: "Stayed active 60 days straight.", unlocked: false },
    ];

    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(achievements.length / itemsPerPage);
    const paginatedAchievements = achievements.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold mb-8 text-white">Your Achievements</h1>

            {/* Achievement Row */}
            <div className="flex justify-center items-center gap-8 w-full max-w-7xl">
                {paginatedAchievements.map((achievement, idx) => (
                    <div
                        key={idx}
                        className={`relative bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-between hover:shadow-2xl transition w-72 h-[500px] overflow-hidden ${achievement.unlocked ? "animate-shimmer" : "opacity-70"}`}
                    >
                        {achievement.unlocked ? null : (
                            <span className="absolute top-4 right-4 bg-gray-300 text-gray-800 text-xs font-semibold px-2 py-1 rounded">LOCKED</span>
                        )}
                        <div className="w-28 h-28 flex items-center justify-center bg-indigo-100 rounded-full mb-4">
                            {achievement.icon}
                        </div>
                        <h2 className="text-xl font-bold text-indigo-700 mb-2 text-center">{achievement.title}</h2>
                        <p className="text-gray-500 text-center text-base mb-4">{achievement.description}</p>
                        {!achievement.unlocked && (
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className="bg-orange-400 h-3 rounded-full w-2/5"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex gap-6 mt-10 items-center">
                <button
                    onClick={handlePrev}
                    className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 disabled:opacity-50"
                    disabled={currentPage === 1}
                >
                    Prev
                </button>
                <span className="text-gray-600 font-semibold text-lg">{currentPage} / {totalPages}</span>
                <button
                    onClick={handleNext}
                    className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 disabled:opacity-50"
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

            {/* Shimmer Animation Style */}
            <style>
                {`
          @keyframes shimmer {
            0% { background-position: -500px 0; }
            100% { background-position: 500px 0; }
          }
          .animate-shimmer {
            background-image: linear-gradient(90deg, #ffffff 25%, #f3f3f3 50%, #ffffff 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }
        `}
            </style>
        </div>
    );
};

export default Achievement;