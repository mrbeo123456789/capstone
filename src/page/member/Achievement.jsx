import React, { useState, useContext } from "react";
import { FaTrophy, FaMountain, FaBullseye, FaStar, FaRocket, FaFire, FaClock,
    FaMedal, FaChess, FaGem, FaLightbulb, FaAward, FaCrown, FaCode,
    FaLaptopCode, FaChartLine, FaGlobe, FaBrain, FaPuzzlePiece } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const Achievement = () => {
    const { t } = useTranslation();

    // Enhanced achievement data with more entries and details - fitness focused
    const achievementsData = [
        {
            icon: <FaTrophy className="text-5xl text-orange-500" />,
            title: "achievement.fitnessChampion",
            description: "achievement.fitnessChampionDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-15",
            earnedBy: 7520
        },
        {
            icon: <FaMountain className="text-5xl text-amber-500" />,
            title: "achievement.peakPerformer",
            description: "achievement.peakPerformerDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-02-28",
            earnedBy: 4340
        },
        {
            icon: <FaBullseye className="text-5xl text-orange-600" />,
            title: "achievement.perfectForm",
            description: "achievement.perfectFormDesc",
            unlocked: false,
            progress: 65,
            dateEarned: null,
            earnedBy: 3120
        },
        // ... remaining achievement data
        {
            icon: <FaStar className="text-5xl text-yellow-500" />,
            title: "achievement.risingAthlete",
            description: "achievement.risingAthleteDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-10",
            earnedBy: 6250
        },
        {
            icon: <FaRocket className="text-5xl text-red-500" />,
            title: "achievement.quickStarter",
            description: "achievement.quickStarterDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-04-02",
            earnedBy: 3870
        },
        {
            icon: <FaFire className="text-5xl text-orange-500" />,
            title: "achievement.trainingStreak",
            description: "achievement.trainingStreakDesc",
            unlocked: false,
            progress: 40,
            dateEarned: null,
            earnedBy: 2180
        },
        {
            icon: <FaClock className="text-5xl text-amber-500" />,
            title: "achievement.hiitMaster",
            description: "achievement.hiitMasterDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-22",
            earnedBy: 4560
        },
        {
            icon: <FaMedal className="text-5xl text-orange-600" />,
            title: "achievement.teamPlayer",
            description: "achievement.teamPlayerDesc",
            unlocked: false,
            progress: 70,
            dateEarned: null,
            earnedBy: 1890
        },
        {
            icon: <FaChess className="text-5xl text-amber-700" />,
            title: "achievement.workoutPlanner",
            description: "achievement.workoutPlannerDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-02-05",
            earnedBy: 2240
        },
        {
            icon: <FaGem className="text-5xl text-amber-400" />,
            title: "achievement.eliteAthlete",
            description: "achievement.eliteAthleteDesc",
            unlocked: false,
            progress: 85,
            dateEarned: null,
            earnedBy: 1250
        },
        {
            icon: <FaLightbulb className="text-5xl text-yellow-400" />,
            title: "achievement.challengeCreator",
            description: "achievement.challengeCreatorDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-30",
            earnedBy: 980
        },
        {
            icon: <FaAward className="text-5xl text-orange-500" />,
            title: "achievement.fitnessMentor",
            description: "achievement.fitnessMentorDesc",
            unlocked: false,
            progress: 55,
            dateEarned: null,
            earnedBy: 1420
        },
        {
            icon: <FaCrown className="text-5xl text-yellow-600" />,
            title: "achievement.cardioKing",
            description: "achievement.cardioKingDesc",
            unlocked: false,
            progress: 33,
            dateEarned: null,
            earnedBy: 760
        },
        {
            icon: <FaFire className="text-5xl text-orange-600" />,
            title: "achievement.calorieCrusher",
            description: "achievement.calorieCrusherDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-05",
            earnedBy: 3280
        },
        {
            icon: <FaMedal className="text-5xl text-amber-600" />,
            title: "achievement.crossTrainer",
            description: "achievement.crossTrainerDesc",
            unlocked: false,
            progress: 50,
            dateEarned: null,
            earnedBy: 2140
        },
        {
            icon: <FaChartLine className="text-5xl text-orange-600" />,
            title: "achievement.progressTracker",
            description: "achievement.progressTrackerDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-02-15",
            earnedBy: 1950
        },
        {
            icon: <FaGlobe className="text-5xl text-amber-700" />,
            title: "achievement.globalAthlete",
            description: "achievement.globalAthleteDesc",
            unlocked: false,
            progress: 60,
            dateEarned: null,
            earnedBy: 1320
        },
        {
            icon: <FaBrain className="text-5xl text-amber-600" />,
            title: "achievement.mindBodyMaster",
            description: "achievement.mindBodyMasterDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-22",
            earnedBy: 890
        },
        {
            icon: <FaPuzzlePiece className="text-5xl text-orange-600" />,
            title: "achievement.balancedDiet",
            description: "achievement.balancedDietDesc",
            unlocked: false,
            progress: 80,
            dateEarned: null,
            earnedBy: 2680
        },
        {
            icon: <FaTrophy className="text-5xl text-orange-500" />,
            title: "achievement.strengthChampion",
            description: "achievement.strengthChampionDesc",
            unlocked: false,
            progress: 30,
            dateEarned: null,
            earnedBy: 1650
        },
        {
            icon: <FaMountain className="text-5xl text-amber-500" />,
            title: "achievement.enduranceBuilder",
            description: "achievement.enduranceBuilderDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-03-10",
            earnedBy: 1120
        },
        {
            icon: <FaBullseye className="text-5xl text-yellow-500" />,
            title: "achievement.goalCrusher",
            description: "achievement.goalCrusherDesc",
            unlocked: false,
            progress: 40,
            dateEarned: null,
            earnedBy: 3450
        },
        {
            icon: <FaTrophy className="text-5xl text-amber-400" />,
            title: "achievement.fitnessLegend",
            description: "achievement.fitnessLegendDesc",
            unlocked: false,
            progress: 25,
            dateEarned: null,
            earnedBy: 430
        },
        {
            icon: <FaMountain className="text-5xl text-orange-400" />,
            title: "achievement.fitnessExplorer",
            description: "achievement.fitnessExplorerDesc",
            unlocked: true,
            progress: 100,
            dateEarned: "2024-01-05",
            earnedBy: 2260
        },
        {
            icon: <FaBullseye className="text-5xl text-amber-400" />,
            title: "achievement.activeLifestyle",
            description: "achievement.activeLifestyleDesc",
            unlocked: false,
            progress: 75,
            dateEarned: null,
            earnedBy: 780
        },
    ];

    // Responsive items per page: less cards on smaller screens
    const getItemsPerPage = () => {
        // Check window width if available (client-side only)
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 1; // Mobile
            if (window.innerWidth < 1024) return 2; // Tablet
            if (window.innerWidth < 1280) return 3; // Small desktop
            return 4; // Large desktop
        }
        return 4; // Default for server-side rendering
    };

    const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
    const [currentPage, setCurrentPage] = useState(1);

    // Update items per page on window resize
    React.useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(getItemsPerPage());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        if (!dateString) return t('achievement.notYetEarned');
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col items-center p-3 sm:p-4 md:p-6 bg-opacity-70 rounded-xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-orange-300">{t('achievement.title')}</h1>

            <div className="w-full max-w-7xl mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 sm:gap-0">
                    <div className="text-amber-50 text-sm sm:text-base">
                        <span className="text-lg sm:text-xl font-semibold">{achievementsData.filter(a => a.unlocked).length}</span> {t('achievement.of')} <span>{achievementsData.length}</span> {t('achievement.achieved')}
                    </div>
                    <div className="bg-orange-800 bg-opacity-50 px-3 py-1 sm:px-4 sm:py-2 rounded-lg">
                        <span className="text-amber-50 font-semibold text-sm sm:text-base">{t('achievement.totalProgress')}: </span>
                        <span className="text-orange-300 font-bold">
                            {Math.round((achievementsData.filter(a => a.unlocked).length / achievementsData.length) * 100)}%
                        </span>
                    </div>
                </div>

                <div className="w-full bg-orange-950 rounded-full h-2 mb-4 sm:mb-6 md:mb-8">
                    <div
                        className="bg-orange-400 h-2 rounded-full"
                        style={{ width: `${(achievementsData.filter(a => a.unlocked).length / achievementsData.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Achievement Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full max-w-7xl">
                {paginatedAchievements.map((achievement, idx) => (
                    <div
                        key={idx}
                        className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-between hover:shadow-2xl transition h-full ${achievement.unlocked ? "animate-shimmer" : "opacity-70"}`}
                    >
                        {achievement.unlocked ? (
                            <span className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-400 text-green-900 text-xs font-semibold px-2 py-1 rounded">{t('achievement.unlocked')}</span>
                        ) : (
                            <span className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gray-300 text-gray-800 text-xs font-semibold px-2 py-1 rounded">{t('achievement.locked')}</span>
                        )}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex items-center justify-center bg-amber-100 rounded-full mb-3 sm:mb-4">
                            {achievement.icon}
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-orange-700 mb-2 text-center">{t(achievement.title)}</h2>
                        <p className="text-gray-500 text-center text-sm sm:text-base mb-3 sm:mb-4">{t(achievement.description)}</p>

                        <div className="w-full mb-3 sm:mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{t('achievement.progress')}</span>
                                <span>{achievement.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                                <div
                                    className={`h-2 sm:h-3 rounded-full ${achievement.unlocked ? 'bg-green-400' : 'bg-orange-400'}`}
                                    style={{ width: `${achievement.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                            <div className="mb-1 sm:mb-2">
                                <span className="font-semibold">{t('achievement.earned')}: </span>
                                <span>{formatDate(achievement.dateEarned)}</span>
                            </div>
                            <div>
                                <span className="font-semibold">{t('achievement.community')}: </span>
                                <span>{achievement.earnedBy.toLocaleString()} {t('achievement.users')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls - Responsive */}
            <div className="flex gap-3 sm:gap-6 mt-6 sm:mt-8 md:mt-10 items-center">
                <button
                    onClick={handlePrev}
                    className="px-3 sm:px-5 py-1 sm:py-2 rounded-lg bg-orange-700 hover:bg-orange-600 text-white disabled:opacity-50 disabled:bg-orange-900 disabled:text-orange-700 text-sm sm:text-base"
                    disabled={currentPage === 1}
                >
                    {t('achievement.prev')}
                </button>
                <span className="text-amber-50 font-semibold text-base sm:text-lg">{currentPage} / {totalPages}</span>
                <button
                    onClick={handleNext}
                    className="px-3 sm:px-5 py-1 sm:py-2 rounded-lg bg-orange-700 hover:bg-orange-600 text-white disabled:opacity-50 disabled:bg-orange-900 disabled:text-orange-700 text-sm sm:text-base"
                    disabled={currentPage === totalPages}
                >
                    {t('achievement.next')}
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