import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid
} from "recharts";

const Charts = () => {
    // Time period state
    const [timePeriod, setTimePeriod] = useState("month");

    // Generate more dense data for each time period
    const generateWeekData = () => {
        // Hours of a week (7 days × 24 hour points)
        const weekData = [];
        for (let day = 0; day < 7; day++) {
            const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const baseMembers = 10 + Math.floor(Math.random() * 15);
            const baseChallenges = 3 + Math.floor(Math.random() * 8);

            for (let hour = 0; hour < 24; hour++) {
                // Add some randomness to simulate real data
                const hourFactor = hour < 12 ? hour / 10 : (24 - hour) / 10;
                const randomFactor = 0.7 + Math.random() * 0.6;

                weekData.push({
                    period: `${dayNames[day]} ${hour}:00`,
                    newMembers: Math.floor(baseMembers * hourFactor * randomFactor),
                    newChallenges: Math.floor(baseChallenges * hourFactor * randomFactor)
                });
            }
        }
        return weekData;
    };

    const generateMonthData = () => {
        // Days of current month (30 days)
        const monthData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = 3; // April (0-indexed)

        for (let day = 1; day <= 30; day++) {
            // Add some cyclical patterns and randomness
            const dayFactor = Math.sin(day / 5) * 0.3 + 0.8;
            const randomFactor = 0.8 + Math.random() * 0.4;

            monthData.push({
                period: `${monthNames[currentMonth]} ${day}`,
                newMembers: Math.floor(30 * dayFactor * randomFactor),
                newChallenges: Math.floor(12 * dayFactor * randomFactor)
            });
        }
        return monthData;
    };

    const generateYearData = () => {
        // Weeks of a year (52 weeks)
        const yearData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let month = 0; month < 12; month++) {
            // Weeks per month (approximately 4-5)
            const weeksInMonth = month === 1 ? 4 : 4 + (month % 2);

            for (let week = 1; week <= weeksInMonth; week++) {
                // Seasonal patterns and events
                const seasonFactor = 1 + 0.3 * Math.sin((month + 3) / 2);
                const randomFactor = 0.85 + Math.random() * 0.3;

                // Special events boost
                const hasEvent = Math.random() > 0.85;
                const eventBoost = hasEvent ? 1.8 : 1;

                yearData.push({
                    period: `${monthNames[month]} W${week}`,
                    newMembers: Math.floor(50 * seasonFactor * randomFactor * eventBoost),
                    newChallenges: Math.floor(20 * seasonFactor * randomFactor * eventBoost)
                });
            }
        }
        return yearData;
    };

    const generateAllTimeData = () => {
        // Monthly data for multiple years (2020-2025)
        const allTimeData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let year = 2020; year <= 2025; year++) {
            for (let month = 0; month < 12; month++) {
                // Skip future months in current year
                if (year === 2025 && month > 2) continue;

                // Growth trend over years
                const yearFactor = (year - 2020) * 0.25 + 0.75;
                // Seasonal factors
                const seasonFactor = 1 + 0.2 * Math.sin((month + 3) / 2);
                // Market events and campaigns
                const hasCampaign = Math.random() > 0.7;
                const campaignBoost = hasCampaign ? 1.5 : 1;
                // Random fluctuations
                const randomFactor = 0.9 + Math.random() * 0.2;

                allTimeData.push({
                    period: `${monthNames[month]} ${year}`,
                    newMembers: Math.floor(70 * yearFactor * seasonFactor * randomFactor * campaignBoost),
                    newChallenges: Math.floor(30 * yearFactor * seasonFactor * randomFactor * campaignBoost)
                });
            }
        }
        return allTimeData;
    };

    // Time period datasets with higher density
    const timeData = {
        week: generateWeekData(),
        month: generateMonthData(),
        year: generateYearData(),
        all: generateAllTimeData()
    };

    // 🏆 Data for Challenges Pie Chart (Donut Chart)
    const challengesData = [
        { name: "Completed", value: 427, color: "#10b981" }, // Green
        { name: "Ongoing", value: 315, color: "#f97316" },   // Orange
        { name: "Pending", value: 184, color: "#3b82f6" },   // Blue
        { name: "Failed", value: 96, color: "#ef4444" },    // Red
    ];

    const totalChallenges = challengesData.reduce((acc, item) => acc + item.value, 0);

    // Custom tooltip for the pie chart
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-800">{payload[0].name}</p>
                    <p className="text-lg font-bold text-orange-600">{payload[0].value} Challenges</p>
                    <p className="text-sm text-gray-500">
                        {((payload[0].value / totalChallenges) * 100).toFixed(1)}% of total
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip for line chart to handle dense data
    const CustomLineTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="font-semibold">
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 gap-6 mt-4">
            {/* 📈 New Members & Challenges Line Chart with Period Selector */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                    <h2 className="text-orange-800 font-bold text-lg">Growth Analysis</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTimePeriod("week")}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                timePeriod === "week"
                                    ? "bg-orange-500 text-white"
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setTimePeriod("month")}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                timePeriod === "month"
                                    ? "bg-orange-500 text-white"
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setTimePeriod("year")}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                timePeriod === "year"
                                    ? "bg-orange-500 text-white"
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            }`}
                        >
                            Year
                        </button>
                        <button
                            onClick={() => setTimePeriod("all")}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                timePeriod === "all"
                                    ? "bg-orange-500 text-white"
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            }`}
                        >
                            All
                        </button>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={timeData[timePeriod]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis
                            dataKey="period"
                            stroke="#6b7280"
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval={timePeriod === "week" ? 11 : timePeriod === "month" ? 2 : 0}
                            tick={{ fontSize: 11 }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip content={<CustomLineTooltip />} />
                        <Legend verticalAlign="bottom" height={36} />
                        <Line
                            name="New Members"
                            type="monotone"
                            dataKey="newMembers"
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: "#ea580c" }}
                        />
                        <Line
                            name="New Challenges"
                            type="monotone"
                            dataKey="newChallenges"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: "#2563eb" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 🏆 Challenge Status Donut Chart with Enhanced Interactivity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                <h2 className="text-orange-800 font-bold mb-4 text-lg">Challenge Status</h2>

                <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-2/3 h-80 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={challengesData}
                                    dataKey="value"
                                    cx="50%" cy="50%"
                                    outerRadius={110}
                                    innerRadius={75}
                                    paddingAngle={3}
                                    cornerRadius={4}
                                    stroke="none"
                                >
                                    {challengesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* 🏆 Center Text Displaying Total Challenges */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-medium text-gray-500">Total</span>
                            <span className="text-3xl font-extrabold text-orange-600">{totalChallenges}</span>
                        </div>
                    </div>

                    {/* 📊 Legends with Enhanced Styling */}
                    <div className="w-full md:w-1/3 flex flex-col justify-center space-y-4 mt-4 md:mt-0 md:ml-6">
                        {challengesData.map((item, index) => (
                            <div key={index} className="flex items-center p-2 rounded-md hover:bg-orange-50 transition-colors">
                                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                                <div>
                                    <span className="text-gray-800 font-medium block">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-gray-700">{item.value}</span>
                                        <span className="text-xs text-gray-500">
                                            ({((item.value / totalChallenges) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Charts;