import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { useTranslation } from "react-i18next";
import { useGetMyStatisticsQuery } from "../../service/memberService";
import { useLazyGetCompletedChallengesQuery } from "../../service/challengeService.js";
import CompletedChallengeCard from "./statistic/CompletedChallengeCard.jsx";

ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data, isLoading } = useGetMyStatisticsQuery();
    const [triggerLoadChallenges, { data: completedChallenges = [], isFetching }] = useLazyGetCompletedChallengesQuery();
    const [hasLoadedChallenges, setHasLoadedChallenges] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
            if (scrollBottom && !hasLoadedChallenges) {
                triggerLoadChallenges();
                setHasLoadedChallenges(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasLoadedChallenges, triggerLoadChallenges]);

    if (isLoading || !data) {
        return <div className="p-6 text-center">{t("statistics.loading")}</div>;
    }

    const {
        fullName,
        avatar,
        createdAt,
        totalChallengesJoined,
        totalChallengesCompleted,
        totalHostedChallenges,
        totalEvidenceSubmitted,
        totalApprovedEvidence,
        totalRejectedEvidence,
        totalVotesGiven,
        totalVotesReceived,
        totalAchievements,
        totalStars,
        totalGroupsJoined,
        totalGroupsLed,
    } = data;

    const completionData = {
        labels: [t("statistics.completed"), t("statistics.incomplete")],
        datasets: [
            {
                data: [totalChallengesCompleted ?? 0, (totalChallengesJoined ?? 0) - (totalChallengesCompleted ?? 0)],
                backgroundColor: ["#4ade80", "#f87171"],
                borderWidth: 1,
            },
        ],
    };

    const evidenceReviewData = {
        labels: [t("statistics.approved"), t("statistics.rejected")],
        datasets: [
            {
                data: [totalApprovedEvidence ?? 0, totalRejectedEvidence ?? 0],
                backgroundColor: ["#60a5fa", "#f87171"],
                borderColor: ["#ffffff", "#ffffff"],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-center mb-6">{t("statistics.title")}</h1>

            <div className="flex flex-col items-center mb-6">
                <img src={avatar} className="rounded-full w-20 h-20" alt="avatar" />
                <h2 className="text-xl font-semibold">{fullName}</h2>
                <p>{t("statistics.memberSince")}: {new Date(createdAt).toLocaleDateString()}</p>
                <p className="text-gray-500">{t("statistics.performanceOverview")}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalChallengesJoined ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.challengesJoined")}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalHostedChallenges ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.challengesHosted")}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalAchievements ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.achievements")}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalGroupsJoined ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.groupsJoined")}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalEvidenceSubmitted ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.evidenceSubmitted")}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalApprovedEvidence ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.evidenceApproved")}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalVotesGiven ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.votesGiven")}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalStars ?? 0}</p>
                    <p className="text-gray-500">{t("statistics.starsEarned")}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-white rounded-lg p-4 shadow max-w-screen-sm">
                    <h3 className="text-center font-semibold mb-4">{t("statistics.evidenceReviewOutcome")}</h3>
                    <Pie data={evidenceReviewData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "bottom",
                                labels: { boxWidth: 20, padding: 20 },
                            },
                            tooltip: { enabled: true },
                        },
                    }} />
                </div>

                <div className="bg-white rounded-lg p-4 shadow max-w-screen-sm">
                    <h3 className="text-center font-semibold mb-4">{t("statistics.challengeCompletion")}</h3>
                    <Pie data={completionData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "bottom",
                                labels: { boxWidth: 20, padding: 20 },
                            },
                            tooltip: { enabled: true },
                        },
                    }} />
                </div>
            </div>

            {hasLoadedChallenges && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">{t("statistics.completedChallenges")}</h2>
                    {isFetching ? (
                        <p>{t("statistics.loadingChallenges")}</p>
                    ) : completedChallenges.length === 0 ? (
                        <div className="h-52 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                            <div>
                                <p className="font-semibold">{t("statistics.noCompletedChallenges")}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {completedChallenges.map((challenge, index) => (
                                <CompletedChallengeCard key={challenge.id} challenge={challenge} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Statistics;