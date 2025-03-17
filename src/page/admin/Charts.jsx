import React from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const Charts = () => {
    // 📈 Data for New Members Line Chart
    const newMembersData = [
        { month: "Jan", newMembers: 50 },
        { month: "Feb", newMembers: 80 },
        { month: "Mar", newMembers: 120 },
        { month: "Apr", newMembers: 90 },
    ];

    // 🏆 Data for Challenges Pie Chart (Donut Chart)
    const challengesData = [
        { name: "Completed", value: 40, color: "#f87171" }, // Red
        { name: "Ongoing", value: 30, color: "#fb923c" }, // Orange
        { name: "Pending", value: 20, color: "#facc15" }, // Yellow
        { name: "Failed", value: 10, color: "#dc2626" }, // Dark Red
    ];

    const totalChallenges = challengesData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* 📈 New Members Line Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-orange-300 font-bold mb-3 text-lg">New Members</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={newMembersData}>
                        <XAxis dataKey="month" stroke="#d1d5db" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newMembers" stroke="#f87171" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 🏆 Challenge Status Donut Chart with Legends on Right */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md flex">
                <div className="relative w-3/4 h-96 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={challengesData}
                                dataKey="value"
                                cx="50%" cy="50%"
                                outerRadius={120}
                                innerRadius={80}
                                labelLine={false}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {challengesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} Challenges`, name]} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* 🏆 Center Text Displaying Total Challenges */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-300">Total</span>
                        <span className="text-4xl font-extrabold text-white">{totalChallenges}</span>
                    </div>
                </div>

                {/* 📊 Legends on the Right Side */}
                <div className="w-1/4 flex flex-col justify-center space-y-3 ml-4">
                    {challengesData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-300 text-sm">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Charts;
