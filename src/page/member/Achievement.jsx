import React, { useState } from "react";
import { FaTrophy, FaMountain, FaBullseye, FaStar, FaRocket, FaFire, FaClock,
    FaMedal, FaChess, FaGem, FaLightbulb, FaAward, FaCrown, FaCode,
    FaLaptopCode, FaChartLine, FaGlobe, FaBrain, FaPuzzlePiece } from "react-icons/fa";

const Achievement = () => {
    // Enhanced achievement data with more entries and details - fitness focused
    const achievementsData = [
        {
            icon: <FaTrophy className="text-5xl text-blue-500" />,
            title: "Fitness Champion",
            description: "Ranked in the top 10 of a monthly challenge.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-15",
            earnedBy: 7520
        },
        {
            icon: <FaMountain className="text-5xl text-purple-500" />,
            title: "Peak Performer",
            description: "Completed an advanced intensity workout program.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-02-28",
            earnedBy: 4340
        },
        {
            icon: <FaBullseye className="text-5xl text-indigo-500" />,
            title: "Perfect Form",
            description: "Received a perfect score on workout technique.",
            unlocked: false,
            progress: 65,
            dateEarned: null,
            earnedBy: 3120
        },
        {
            icon: <FaStar className="text-5xl text-yellow-500" />,
            title: "Rising Athlete",
            description: "Improved fitness score by 50% in a month.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-10",
            earnedBy: 6250
        },
        {
            icon: <FaRocket className="text-5xl text-red-500" />,
            title: "Quick Starter",
            description: "Completed 5 different workouts in a day.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-04-02",
            earnedBy: 3870
        },
        {
            icon: <FaFire className="text-5xl text-orange-500" />,
            title: "Training Streak",
            description: "10-day streak of completing workouts.",
            unlocked: false,
            progress: 40,
            dateEarned: null,
            earnedBy: 2180
        },
        {
            icon: <FaClock className="text-5xl text-teal-500" />,
            title: "HIIT Master",
            description: "Complete a HIIT workout with perfect timing.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-22",
            earnedBy: 4560
        },
        {
            icon: <FaMedal className="text-5xl text-pink-500" />,
            title: "Team Player",
            description: "Complete 10 group workouts.",
            unlocked: false,
            progress: 70,
            dateEarned: null,
            earnedBy: 1890
        },
        {
            icon: <FaChess className="text-5xl text-gray-700" />,
            title: "Workout Planner",
            description: "Create a custom training plan and complete it.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-02-05",
            earnedBy: 2240
        },
        {
            icon: <FaGem className="text-5xl text-blue-400" />,
            title: "Elite Athlete",
            description: "Maintain top 5% fitness rank for a month.",
            unlocked: false,
            progress: 85,
            dateEarned: null,
            earnedBy: 1250
        },
        {
            icon: <FaLightbulb className="text-5xl text-yellow-400" />,
            title: "Challenge Creator",
            description: "Create a workout challenge with 100+ participants.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-30",
            earnedBy: 980
        },
        {
            icon: <FaAward className="text-5xl text-green-500" />,
            title: "Fitness Mentor",
            description: "Help 20 other users with their workout form.",
            unlocked: false,
            progress: 55,
            dateEarned: null,
            earnedBy: 1420
        },
        {
            icon: <FaCrown className="text-5xl text-yellow-600" />,
            title: "Cardio King",
            description: "Win 3 consecutive cardio challenges.",
            unlocked: false,
            progress: 33,
            dateEarned: null,
            earnedBy: 760
        },
        {
            icon: <FaFire className="text-5xl text-gray-600" />,
            title: "Calorie Crusher",
            description: "Burn 5,000 calories in a week.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-05",
            earnedBy: 3280
        },
        {
            icon: <FaMedal className="text-5xl text-indigo-600" />,
            title: "Cross-Trainer",
            description: "Complete workouts across 5 different fitness categories.",
            unlocked: false,
            progress: 50,
            dateEarned: null,
            earnedBy: 2140
        },
        {
            icon: <FaChartLine className="text-5xl text-green-600" />,
            title: "Progress Tracker",
            description: "Log workouts for 30 consecutive days.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-02-15",
            earnedBy: 1950
        },
        {
            icon: <FaGlobe className="text-5xl text-blue-700" />,
            title: "Global Athlete",
            description: "Join workouts with users from 5 different countries.",
            unlocked: false,
            progress: 60,
            dateEarned: null,
            earnedBy: 1320
        },
        {
            icon: <FaBrain className="text-5xl text-purple-600" />,
            title: "Mind-Body Master",
            description: "Complete 10 mindfulness and yoga sessions.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-22",
            earnedBy: 890
        },
        {
            icon: <FaPuzzlePiece className="text-5xl text-orange-600" />,
            title: "Balanced Diet",
            description: "Log nutrition goals for 25 days.",
            unlocked: false,
            progress: 80,
            dateEarned: null,
            earnedBy: 2680
        },
        {
            icon: <FaTrophy className="text-5xl text-green-500" />,
            title: "Strength Champion",
            description: "Set 10 personal records in strength exercises.",
            unlocked: false,
            progress: 30,
            dateEarned: null,
            earnedBy: 1650
        },
        {
            icon: <FaMountain className="text-5xl text-pink-500" />,
            title: "Endurance Builder",
            description: "Complete a 2-hour endurance challenge.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-10",
            earnedBy: 1120
        },
        {
            icon: <FaBullseye className="text-5xl text-yellow-500" />,
            title: "Goal Crusher",
            description: "Achieve 5 personal fitness goals.",
            unlocked: false,
            progress: 40,
            dateEarned: null,
            earnedBy: 3450
        },
        {
            icon: <FaTrophy className="text-5xl text-blue-400" />,
            title: "Fitness Legend",
            description: "Achieve the highest fitness level in the system.",
            unlocked: false,
            progress: 25,
            dateEarned: null,
            earnedBy: 430
        },
        {
            icon: <FaMountain className="text-5xl text-purple-400" />,
            title: "Fitness Explorer",
            description: "Try workouts across all fitness categories.",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-05",
            earnedBy: 2260
        },
        {
            icon: <FaBullseye className="text-5xl text-indigo-400" />,
            title: "Active Lifestyle",
            description: "Record physical activity for 60 days straight.",
            unlocked: false,
            progress: 75,
            dateEarned: null,
            earnedBy: 780
        },
    ];

    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(achievementsData.length / itemsPerPage);
    const paginatedAchievements = achievementsData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not yet earned';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col items-center p-6 bg-blue-900 bg-opacity-20 rounded-xl">
            <h1 className="text-3xl font-bold mb-8 text-blue-300">Your Achievements</h1>

            <div className="w-full max-w-7xl mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-amber-50">
                        <span className="text-xl font-semibold">{achievementsData.filter(a => a.unlocked).length}</span> of <span>{achievementsData.length}</span> achievements unlocked
                    </div>
                    <div className="bg-blue-800 bg-opacity-50 px-4 py-2 rounded-lg">
                        <span className="text-amber-50 font-semibold">Total Progress: </span>
                        <span className="text-blue-300 font-bold">
                            {Math.round((achievementsData.filter(a => a.unlocked).length / achievementsData.length) * 100)}%
                        </span>
                    </div>
                </div>

                <div className="w-full bg-blue-950 rounded-full h-2 mb-8">
                    <div
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${(achievementsData.filter(a => a.unlocked).length / achievementsData.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Achievement Row */}
            <div className="flex justify-center items-center gap-8 w-full max-w-7xl">
                {paginatedAchievements.map((achievement, idx) => (
                    <div
                        key={idx}
                        className={`relative bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-between hover:shadow-2xl transition w-72 h-[500px] overflow-hidden ${achievement.unlocked ? "animate-shimmer" : "opacity-70"}`}
                    >
                        {achievement.unlocked ? (
                            <span className="absolute top-4 right-4 bg-green-400 text-green-900 text-xs font-semibold px-2 py-1 rounded">UNLOCKED</span>
                        ) : (
                            <span className="absolute top-4 right-4 bg-gray-300 text-gray-800 text-xs font-semibold px-2 py-1 rounded">LOCKED</span>
                        )}
                        <div className="w-28 h-28 flex items-center justify-center bg-indigo-100 rounded-full mb-4">
                            {achievement.icon}
                        </div>
                        <h2 className="text-xl font-bold text-indigo-700 mb-2 text-center">{achievement.title}</h2>
                        <p className="text-gray-500 text-center text-base mb-4">{achievement.description}</p>

                        <div className="w-full mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${achievement.unlocked ? 'bg-green-400' : 'bg-orange-400'}`}
                                    style={{ width: `${achievement.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                            <div className="mb-2">
                                <span className="font-semibold">Earned: </span>
                                <span>{formatDate(achievement.dateEarned)}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Community: </span>
                                <span>{achievement.earnedBy.toLocaleString()} users</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex gap-6 mt-10 items-center">
                <button
                    onClick={handlePrev}
                    className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 disabled:bg-blue-900 disabled:text-blue-700"
                    disabled={currentPage === 1}
                >
                    Prev
                </button>
                <span className="text-amber-50 font-semibold text-lg">{currentPage} / {totalPages}</span>
                <button
                    onClick={handleNext}
                    className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 disabled:bg-blue-900 disabled:text-blue-700"
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