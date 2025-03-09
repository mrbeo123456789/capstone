import React from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from "recharts";
import { FaUsers, FaTrophy, FaExclamationTriangle } from "react-icons/fa";

const ExtraCharts = () => {
    const membersData = [
        { month: "Jan", total: 200, active: 150, inactive: 50 },
        { month: "Feb", total: 250, active: 190, inactive: 60 },
        { month: "Mar", total: 300, active: 230, inactive: 70 },
        { month: "Apr", total: 350, active: 270, inactive: 80 },
        { month: "May", total: 400, active: 320, inactive: 80 },
        { month: "Jun", total: 420, active: 340, inactive: 80 },
        { month: "Jul", total: 450, active: 360, inactive: 90 },
    ];

    const newChallengesData = [
        { month: "Jan", newChallenges: 30 },
        { month: "Feb", newChallenges: 50 },
        { month: "Mar", newChallenges: 70 },
        { month: "Apr", newChallenges: 40 },
    ];

    const summaryData = [
        {
            icon: <FaUsers className="text-purple-400 text-xl" />,
            label: "Total Users",
            value: 1250,
            color: "bg-purple-400",
            progress: 80, // Percentage
        },
        {
            icon: <FaTrophy className="text-green-400 text-xl" />,
            label: "Total Challenges",
            value: 350,
            color: "bg-green-400",
            progress: 65,
        },
        {
            icon: <FaExclamationTriangle className="text-orange-400 text-xl" />,
            label: "Total Reports",
            value: 45,
            color: "bg-orange-400",
            progress: 30,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* 📊 Total & Active Members Stacked Column Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-red-400 font-bold mb-4 text-lg">Total & Active Members</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={membersData} stackOffset="expand">
                        <XAxis dataKey="month" stroke="#e5e7eb" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="active" stackId="a" fill="#facc15" radius={[5, 5, 0, 0]} />
                        <Bar dataKey="inactive" stackId="a" fill="#e5e7eb" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 📄 Admin Summary Section with Icons & Progress Bars */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-bold text-lg">Summary</h2>
                    <span className="text-gray-400 cursor-pointer hover:text-white">⋮</span>
                </div>
                <div className="space-y-4">
                    {summaryData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700">
                                {item.icon}
                            </div>
                            {/* Label & Progress */}
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">{item.label}</span>
                                    <span className="text-gray-100 font-semibold">{item.value.toLocaleString()}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
                                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 📈 New Challenges Line Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-orange-400 font-bold mb-4 text-lg">New Challenges</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={newChallengesData}>
                        <XAxis dataKey="month" stroke="#e5e7eb" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newChallenges" stroke="#facc15" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExtraCharts;
