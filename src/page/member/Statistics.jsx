import React, { useEffect, useState } from "react";
import { FaStar, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from "chart.js";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useGetMyStatisticsQuery } from "../../service/memberService";
import {useLazyGetCompletedChallengesQuery} from "../../service/challengeService.js";
import CompletedChallengeCard from "./statistic/CompletedChallengeCard.jsx";

// ✅ Assume you have this query setup in your service file

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Statistics = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useGetMyStatisticsQuery();

    const [triggerLoadChallenges, { data: completedChallenges = [], isFetching }] = useLazyGetCompletedChallengesQuery();
    const [hasLoadedChallenges, setHasLoadedChallenges] = useState(false);

    // Scroll to bottom listener
    useEffect(() => {
        const handleScroll = () => {
            const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
            if (scrollBottom && !hasLoadedChallenges) {
                triggerLoadChallenges(); // 👈 call service
                setHasLoadedChallenges(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasLoadedChallenges, triggerLoadChallenges]);

    if (isLoading || !data) {
        return <div className="p-6 text-center">Loading your statistics...</div>;
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
        labels: ["Completed", "Incomplete"],
        datasets: [
            {
                data: [totalChallengesCompleted ?? 0, (totalChallengesJoined ?? 0) - (totalChallengesCompleted ?? 0)],
                backgroundColor: ["#4ade80", "#f87171"],
                borderWidth: 1,
            },
        ],
    };

    const barData = {
        labels: ["Jan", "Feb", "Mar", "Apr"],
        datasets: [
            {
                label: "Challenges Joined",
                data: [5, 10, 15, 13],
                backgroundColor: "#60a5fa",
            },
        ],
    };

    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-6">Statistics</h1>

            {/* Profile */}
            <div className="flex flex-col items-center mb-6">
                <img src={avatar} className="rounded-full w-20 h-20" alt="avatar" />
                <h2 className="text-xl font-semibold">{fullName}</h2>
                <p>Member since: {new Date(createdAt).toLocaleDateString()}</p>
                <p className="text-gray-500">Your performance overview</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {/* ... same as before */}
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalChallengesJoined ?? 0}</p>
                    <p className="text-gray-500">Challenges joined</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalHostedChallenges ?? 0}</p>
                    <p className="text-gray-500">Challenges hosted</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalAchievements ?? 0}</p>
                    <p className="text-gray-500">Achievements</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalGroupsJoined ?? 0}</p>
                    <p className="text-gray-500">Groups joined</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalEvidenceSubmitted ?? 0}</p>
                    <p className="text-gray-500">Evidence submitted</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalApprovedEvidence ?? 0}</p>
                    <p className="text-gray-500">Evidence approved</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalVotesGiven ?? 0}</p>
                    <p className="text-gray-500">Votes given</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{totalStars ?? 0}</p>
                    <p className="text-gray-500">Stars earned</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-white rounded-lg p-4 shadow">
                    <h3 className="text-center font-semibold mb-4">Challenges Joined (Months)</h3>
                    <Bar data={barData} />
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                    <h3 className="text-center font-semibold mb-4">Completion Rate</h3>
                    <div className="flex h-[430px] flex-col lg:flex-row">
                        <Pie data={completionData} />
                        <div className="justify-center gap-4 mt-4 text-sm w-full">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-400 rounded-full" />
                                Completed
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-400 rounded-full" />
                                Incomplete
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {hasLoadedChallenges && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Completed Challenges</h2>
                    {isFetching ? (
                        <p>Loading completed challenges...</p>
                    ) : completedChallenges.length === 0 ? (
                        <div className="h-52 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-center">
                            <div>
                                <p className="font-semibold">You have not completed any challenges yet.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {completedChallenges.map((challenge, index) => (
                                <CompletedChallengeCard key={challenge.id} challenge={challenge} index={index}/>
                            ))}
                        </div>

                    )}
                </div>
            )}


        </div>
    );
};

export default Statistics;
