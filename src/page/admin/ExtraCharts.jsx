import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
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

    const summaryData = [
        {
            icon: <FaUsers className="text-orange-500 text-xl" />,
            label: "Total Users",
            value: 1250,
            color: "bg-orange-500",
            progress: 80, // Percentage
        },
        {
            icon: <FaTrophy className="text-orange-400 text-xl" />,
            label: "Total Challenges",
            value: 350,
            color: "bg-orange-400",
            progress: 65,
        },
        {
            icon: <FaExclamationTriangle className="text-orange-300 text-xl" />,
            label: "Total Reports",
            value: 45,
            color: "bg-orange-300",
            progress: 30,
        }
    ];

    const customTooltipStyle = {
        backgroundColor: "rgba(255, 250, 240, 0.95)",
        border: "1px solid #FFEDD5",
        borderRadius: "8px",
        padding: "10px",
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 shadow-lg border border-orange-200 rounded-lg">
                    <p className="text-gray-800 font-medium">{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* 📊 Total & Active Members Stacked Column Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                <h2 className="text-orange-600 font-bold mb-4 text-lg">Total & Active Members</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={membersData} stackOffset="expand">
                        <XAxis dataKey="month" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="active" stackId="a" fill="#F97316" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="inactive" stackId="a" fill="#FFEDD5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 📄 Admin Summary Section with Icons & Progress Bars */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-orange-600 font-bold text-lg">Summary</h2>
                    <span className="text-gray-400 cursor-pointer hover:text-orange-500 transition-colors">⋮</span>
                </div>
                <div className="space-y-6">
                    {summaryData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 shadow-sm">
                                {item.icon}
                            </div>
                            {/* Label & Progress */}
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600 font-medium">{item.label}</span>
                                    <span className="text-gray-800 font-bold">{item.value.toLocaleString()}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-orange-100 h-3 rounded-full">
                                    <div className={`${item.color} h-3 rounded-full transition-all duration-500 ease-in-out`} style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExtraCharts;