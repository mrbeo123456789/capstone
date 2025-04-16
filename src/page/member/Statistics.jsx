import React from "react";
import { FaStar, FaUsers, FaTrophy, FaFire } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import {IoCloudUploadOutline} from "react-icons/io5";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Statistics = () => {
    const navigate = useNavigate();

    // Mock data
    const challengesJoined = 30;
    const starsEarned = 100;
    const achievements = 25;
    const groupsJoined = 5;
    const joinDate = "11/01/2025";

    const completionData = {
        labels: ["Complete", "Fail"],
        datasets: [
            {
                data: [60, 40],
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

    const completedChallenges = [
        { id: 1, name: "Challenge A", rating: 4.5 },
        { id: 2, name: "Challenge B", rating: 3 },
        { id: 3, name: "Challenge C", rating: 4 },
        { id: 4, name: "Challenge D", rating: 5 },
    ];

    return (
        <div className="p-6 space-y-6 bg-white rounded-lg shadow-lg">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-6">Statistics</h1>

            {/* Profile */}
            <div className="flex flex-col items-center mb-6">
                <FaUsers className="text-6xl text-gray-400 mb-2" />
                <h2 className="text-xl font-semibold">Le Van Duy</h2>
                <p className="text-gray-500">Member since: {joinDate}</p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{challengesJoined}</p>
                    <p className="text-gray-500">Challenges joined</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{starsEarned}</p>
                    <p className="text-gray-500">Stars earned</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{achievements}</p>
                    <p className="text-gray-500">Achievements</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-2xl font-bold">{groupsJoined}</p>
                    <p className="text-gray-500">Groups joined</p>
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
                    <Pie data={completionData} />
                    <div className="flex justify-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-400 rounded-full" />
                            Complete
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-400 rounded-full" />
                            Fail
                        </div>
                    </div>
                </div>
            </div>

            {/* Completed Challenges */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Completed Challenges</h2>
                <div className="flex gap-4 overflow-x-auto">
                    {completedChallenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className="min-w-[150px] border rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition cursor-pointer flex-shrink-0"
                        >
                            <div className="bg-gray-200 w-full h-24 rounded mb-4 flex items-center justify-center">
                                <IoCloudUploadOutline className="text-4xl text-gray-500" />
                            </div>
                            <p className="font-medium">{challenge.name}</p>
                            <div className="flex items-center mt-2 text-pink-400 font-bold">
                                <FaStar className="mr-1" />
                                {challenge.rating}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Statistics;
