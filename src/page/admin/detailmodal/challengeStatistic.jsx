import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from "../../navbar/AdminNavbar.jsx";

const UserChallengeStats = () => {
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    // Mock user data
    const userData = {
        username: "challenge_creator",
        createdChallenges: [
            { id: 1, name: "30-Day Fitness", category: "Health", difficulty: "Medium", totalMembers: 156, completionRate: 68, reportCount: 2, active: true },
            { id: 2, name: "Learn JavaScript", category: "Education", difficulty: "Hard", totalMembers: 89, completionRate: 45, reportCount: 0, active: true },
            { id: 3, name: "Spanish in 60 Days", category: "Language", difficulty: "Medium", totalMembers: 210, completionRate: 32, reportCount: 5, active: true },
            { id: 4, name: "Read 12 Books", category: "Personal", difficulty: "Easy", totalMembers: 75, completionRate: 81, reportCount: 1, active: false },
            { id: 5, name: "5K Training", category: "Fitness", difficulty: "Hard", totalMembers: 124, completionRate: 59, reportCount: 3, active: true },
            { id: 6, name: "Daily Meditation", category: "Wellness", difficulty: "Easy", totalMembers: 302, completionRate: 76, reportCount: 0, active: true },
        ]
    };

    // Mock report data for when a challenge is selected
    const mockReports = {
        1: [
            { id: 101, user: "user123", reason: "Inappropriate content", details: "Challenge contains offensive language", date: "2025-04-10" },
            { id: 102, user: "fitness_lover", reason: "Too difficult", details: "Tasks are not achievable for beginners", date: "2025-04-15" }
        ],
        2: [],
        3: [
            { id: 103, user: "language_learner", reason: "Misleading description", details: "Challenge claims to be for beginners but requires advanced knowledge", date: "2025-03-12" },
            { id: 104, user: "spanish_expert", reason: "Incorrect information", details: "Some language examples are grammatically incorrect", date: "2025-03-15" },
            { id: 105, user: "new_student", reason: "Too difficult", details: "Progression is too steep between lessons", date: "2025-03-20" },
            { id: 106, user: "beginner101", reason: "Unclear instructions", details: "Day 5 challenge instructions are confusing", date: "2025-03-22" },
            { id: 107, user: "language_fan", reason: "Technical issues", details: "Audio examples not working properly", date: "2025-04-01" }
        ],
        4: [
            { id: 108, user: "bookworm", reason: "Tracking issue", details: "Book completion tracking not working", date: "2025-01-05" }
        ],
        5: [
            { id: 109, user: "runner42", reason: "Technical issues", details: "Distance tracking not accurate", date: "2025-03-02" },
            { id: 110, user: "jogger55", reason: "Too difficult", details: "Progression between weeks is too steep", date: "2025-03-10" },
            { id: 111, user: "fitness_beginner", reason: "Medical concern", details: "No warnings about consulting doctor before starting", date: "2025-03-18" }
        ],
        6: []
    };

    const handleRowClick = (challenge) => {
        setSelectedChallenge(challenge.id === selectedChallenge ? null : challenge.id);
    };

    // Filter challenges based on search term
    const filteredChallenges = userData.createdChallenges.filter(challenge =>
        challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        // Reset selected challenge when searching
        setSelectedChallenge(null);
    };

    // Custom colors for charts
    const chartColors = {
        completion: '#3b82f6',
        reports: '#f97316',
        members: '#8b5cf6',
        barHover: '#60a5fa'
    };

    // Custom tooltip styles
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
                    <p className="font-semibold text-gray-700">{data.name}</p>
                    <p className="text-sm text-gray-600">
                        {payload[0].name}: <span className="font-medium">{payload[0].value}{payload[0].dataKey === 'rate' ? '%' : ''}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-blue-50 min-h-screen">
            {/* Side Navigation */}
            <div className="flex w-full overflow-hidden">
                {/* Sidebar - Collapsible */}
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}/>
                </div>

                {/* Content - Full width with proper padding */}
                <div className="flex-1 p-6 overflow-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                            <h3 className="font-bold text-lg mb-2 text-gray-800">Total Created</h3>
                            <p className="text-3xl font-bold text-blue-600">{userData.createdChallenges.length}</p>
                            <p className="text-sm mt-2 text-green-600">+2 this month</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
                            <h3 className="font-bold text-lg mb-2 text-gray-800">Active Challenges</h3>
                            <p className="text-3xl font-bold text-indigo-600">
                                {userData.createdChallenges.filter(challenge => challenge.active).length}
                            </p>
                            <p className="text-sm mt-2 text-green-600">No change from last week</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
                            <h3 className="font-bold text-lg mb-2 text-gray-800">Total Participants</h3>
                            <p className="text-3xl font-bold text-purple-600">
                                {userData.createdChallenges.reduce((total, challenge) => total + challenge.totalMembers, 0)}
                            </p>
                            <p className="text-sm mt-2 text-green-600">+45 this week</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Average Completion Rate Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Completion Rates</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={filteredChallenges.map(challenge => ({
                                            name: challenge.name.length > 15 ? challenge.name.substring(0, 15) + '...' : challenge.name,
                                            rate: challenge.completionRate,
                                            fullName: challenge.name
                                        }))}
                                        margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#4b5563', fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fill: '#4b5563', fontSize: 12 }}
                                            tickFormatter={(tick) => `${tick}%`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="rate"
                                            fill={chartColors.completion}
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        >
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Reports Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Reports Received</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={userData.createdChallenges.map(challenge => ({
                                            name: challenge.name.length > 15 ? challenge.name.substring(0, 15) + '...' : challenge.name,
                                            reports: challenge.reportCount,
                                            fullName: challenge.name
                                        }))}
                                        margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#4b5563', fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fill: '#4b5563', fontSize: 12 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="reports"
                                            fill={chartColors.reports}
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Member Participation */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Member Participation</h2>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={userData.createdChallenges.map(challenge => ({
                                        name: challenge.name.length > 15 ? challenge.name.substring(0, 15) + '...' : challenge.name,
                                        members: challenge.totalMembers,
                                        fullName: challenge.name
                                    }))}
                                    margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#4b5563', fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: '#4b5563', fontSize: 12 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="members"
                                        fill={chartColors.members}
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Challenges Table */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Created Challenges</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search challenges..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left">Challenge Name</th>
                                    <th className="py-3 px-4 text-left">Category</th>
                                    <th className="py-3 px-4 text-left">Members</th>
                                    <th className="py-3 px-4 text-left">Completion Rate</th>
                                    <th className="py-3 px-4 text-left">Reports</th>
                                    <th className="py-3 px-4 text-left">Status</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredChallenges.map((challenge) => (
                                    <React.Fragment key={challenge.id}>
                                        <tr
                                            className={`cursor-pointer hover:bg-gray-50 ${selectedChallenge === challenge.id ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleRowClick(challenge)}
                                        >
                                            <td className="py-3 px-4">{challenge.name}</td>
                                            <td className="py-3 px-4">{challenge.category}</td>
                                            <td className="py-3 px-4">{challenge.totalMembers}</td>
                                            <td className="py-3 px-4">{challenge.completionRate}%</td>
                                            <td className="py-3 px-4">
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  challenge.reportCount === 0 ? 'bg-green-100 text-green-800' :
                                                      challenge.reportCount < 3 ? 'bg-yellow-100 text-yellow-800' :
                                                          'bg-red-100 text-red-800'
                                              }`}>
                                                {challenge.reportCount}
                                              </span>
                                            </td>
                                            <td className="py-3 px-4">
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  challenge.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                              }`}>
                                                {challenge.active ? 'Active' : 'Inactive'}
                                              </span>
                                            </td>
                                        </tr>
                                        {selectedChallenge === challenge.id && mockReports[challenge.id].length > 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-3 bg-gray-50">
                                                    <div className="py-2">
                                                        <h3 className="font-semibold text-gray-900 mb-2">Reports for {challenge.name}</h3>
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full bg-white border border-gray-200 rounded-md">
                                                                <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="py-2 px-3 text-left text-xs font-medium">User</th>
                                                                    <th className="py-2 px-3 text-left text-xs font-medium">Reason</th>
                                                                    <th className="py-2 px-3 text-left text-xs font-medium">Details</th>
                                                                    <th className="py-2 px-3 text-left text-xs font-medium">Date</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200">
                                                                {mockReports[challenge.id].map(report => (
                                                                    <tr key={report.id} className="text-sm">
                                                                        <td className="py-2 px-3">{report.user}</td>
                                                                        <td className="py-2 px-3">
                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                                    report.reason === 'Inappropriate content' ? 'bg-red-100 text-red-800' :
                                                                                        report.reason === 'Too difficult' ? 'bg-yellow-100 text-yellow-800' :
                                                                                            report.reason === 'Technical issues' ? 'bg-blue-100 text-blue-800' :
                                                                                                'bg-gray-100 text-gray-800'
                                                                                }`}>
                                                                                    {report.reason}
                                                                                </span>
                                                                        </td>
                                                                        <td className="py-2 px-3">{report.details}</td>
                                                                        <td className="py-2 px-3">{report.date}</td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {selectedChallenge === challenge.id && mockReports[challenge.id].length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-3 bg-gray-50">
                                                    <div className="py-2 text-center text-gray-500">
                                                        No reports for this challenge.
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserChallengeStats;