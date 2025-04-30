import React, { useState, useEffect } from "react";
import { useGetMyAchievementsQuery } from "../../service/achievementService.js";
import { achievementIconMap } from "../../contant/achievementIconMap.jsx";
import { useTranslation } from "react-i18next";
import { FaTrophy } from "react-icons/fa";

const Achievement = () => {
    const { t } = useTranslation();
    const { data: achievementsData = [], isLoading, isError } = useGetMyAchievementsQuery();

    const getItemsPerPage = () => {
        if (typeof window !== "undefined") {
            if (window.innerWidth < 640) return 1;
            if (window.innerWidth < 1024) return 2;
            if (window.innerWidth < 1280) return 3;
            return 4;
        }
        return 4;
    };

    const formatDate = (dateString) => {
        if (!dateString) return t("achievement.label.notYetEarned");
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            setItemsPerPage(getItemsPerPage());
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isLoading) return <div className="text-white">{t("achievement.label.loading")}</div>;
    if (isError) return <div className="text-red-500">{t("achievement.label.error")}</div>;

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

    return  (
        <div className="flex flex-col items-center p-3 sm:p-4 md:p-6 bg-blue-900 bg-opacity-20 rounded-xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-blue-300">
                {t("achievement.label.title")}
            </h1>

            <div className="w-full max-w-7xl mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 sm:gap-0">
                    <div className="text-amber-50 text-sm sm:text-base">
                        <span className="text-lg sm:text-xl font-semibold">
                            {achievementsData.filter((a) => a.unlocked).length}
                        </span>{" "}
                        {t("achievement.label.of")}{" "}
                        <span>{achievementsData.length}</span>{" "}
                        {t("achievement.label.achievementsUnlocked")}
                    </div>
                    <div className="bg-blue-800 bg-opacity-50 px-3 py-1 sm:px-4 sm:py-2 rounded-lg">
                        <span className="text-amber-50 font-semibold text-sm sm:text-base">
                            {t("achievement.label.totalProgress")}:
                        </span>{" "}
                        <span className="text-blue-300 font-bold">
                            {Math.round(
                                (achievementsData.filter((a) => a.unlocked).length /
                                    achievementsData.length) *
                                100
                            )}
                            %
                        </span>
                    </div>
                </div>

                <div className="w-full bg-blue-950 rounded-full h-2 mb-4 sm:mb-6 md:mb-8">
                    <div
                        className="bg-blue-400 h-2 rounded-full"
                        style={{
                            width: `${
                                (achievementsData.filter((a) => a.unlocked).length /
                                    achievementsData.length) *
                                100
                            }%`,
                        }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full max-w-7xl">
                {paginatedAchievements.map((achievement, idx) => (
                    <div
                        key={idx}
                        className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-between hover:shadow-2xl transition h-full ${
                            achievement.unlocked ? "animate-shimmer" : "opacity-70"
                        }`}
                    >
                        <span
                            className={`absolute top-2 sm:top-4 right-2 sm:right-4 text-xs font-semibold px-2 py-1 rounded ${
                                achievement.unlocked
                                    ? "bg-green-400 text-green-900"
                                    : "bg-gray-300 text-gray-800"
                            }`}
                        >
                            {achievement.unlocked
                                ? t("achievement.label.unlocked")
                                : t("achievement.label.locked")}
                        </span>

                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 flex items-center justify-center bg-indigo-100 rounded-full mb-3 sm:mb-4">
                            {achievementIconMap[achievement.type] || (
                                <FaTrophy className="text-5xl text-gray-400" />
                            )}
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-2 text-center">
                            {achievement.name}
                        </h2>

                        <p className="text-gray-500 text-center text-sm sm:text-base mb-3 sm:mb-4">
                            {t(`achievement.description.${achievement.type}`)}
                        </p>

                        <div className={`w-full mb-3 sm:mb-4 ${!achievement.hasProgress ? "invisible" : ""}`}>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{t("achievement.label.progress")}</span>
                                <span>{achievement.hasProgress ? `${achievement.progress}%` : ""}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                                <div
                                    className={`h-2 sm:h-3 rounded-full ${
                                        achievement.unlocked ? "bg-green-400" : "bg-orange-400"
                                    }`}
                                    style={{ width: `${achievement.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mb-1 sm:mb-2 text-xs text-gray-600">
                            <span className="font-semibold">{t("achievement.label.earned")} </span>
                            <span>{formatDate(achievement.achievedAt)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 sm:gap-6 mt-6 sm:mt-8 md:mt-10 items-center">
                <button
                    onClick={handlePrev}
                    className="px-3 sm:px-5 py-1 sm:py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 disabled:bg-blue-900 disabled:text-blue-700 text-sm sm:text-base"
                    disabled={currentPage === 1}
                >
                    {t("achievement.label.prev")}
                </button>
                <span className="text-amber-50 font-semibold text-base sm:text-lg">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    className="px-3 sm:px-5 py-1 sm:py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50 disabled:bg-blue-900 disabled:text-blue-700 text-sm sm:text-base"
                    disabled={currentPage === totalPages}
                >
                    {t("achievement.label.next")}
                </button>
            </div>

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
