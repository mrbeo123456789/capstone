import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from "../../navbar/AdminNavbar.jsx";
import { useGetCreatedChallengesQuery, useGetMemberParticipationChartQuery, useGetAdminReportCountsQuery } from '../../../service/adminService.js';

const ChallengeStats = () => {
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);

    // Fetch data from API endpoints
    const { data, isLoading: isLoadingChallenges } = useGetCreatedChallengesQuery({
        keyword: searchTerm,
        page
    });
    const createdChallengesData = data?.content || [];

    const { data: participationResponse, isLoading: isLoadingParticipation } = useGetMemberParticipationChartQuery();
    const memberParticipationData = participationResponse || [];

    const { data: reportsResponse, isLoading: isLoadingReports } = useGetAdminReportCountsQuery();
    const reportCountsData = reportsResponse || [];

    // Derive statistics from API data
    const totalCreatedChallenges = data?.totalElements || 0;
    const activeChallenges = Array.isArray(createdChallengesData) ?
        createdChallengesData.filter(challenge => challenge.status === "Active").length : 0;
    const totalParticipants = Array.isArray(memberParticipationData) ?
        memberParticipationData.reduce((total, challenge) => total + (challenge.members || 0), 0) : 0;

    const handleRowClick = (challenge) => {
        setSelectedChallenge(challenge.id === selectedChallenge ? null : challenge.id);
    };

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
                        {payload[0].name}: <span className="font-medium">{payload[0].value}{payload[0].dataKey === 'completionRate' ? '%' : ''}</span>
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
                            <p className="text-3xl font-bold text-blue-600">{totalCreatedChallenges}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
                            <h3 className="font-bold text-lg mb-2 text-gray-800">Active Challenges</h3>
                            <p className="text-3xl font-bold text-indigo-600">{activeChallenges}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
                            <h3 className="font-bold text-lg mb-2 text-gray-800">Total Participants</h3>
                            <p className="text-3xl font-bold text-purple-600">{totalParticipants}</p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Average Completion Rate Chart */}
                        {/*<div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">*/}
                        {/*    <h2 className="text-xl font-bold mb-4 text-gray-800">Completion Rates</h2>*/}
                        {/*    <div className="h-72">*/}
                        {/*        {isLoadingChallenges ? (*/}
                        {/*            <div className="flex items-center justify-center h-full">*/}
                        {/*                <p>Loading chart data...</p>*/}
                        {/*            </div>*/}
                        {/*        ) : (*/}
                        {/*            <ResponsiveContainer width="100%" height="100%">*/}
                        {/*                <BarChart*/}
                        {/*                    data={Array.isArray(createdChallengesData) ? createdChallengesData.map(challenge => ({*/}
                        {/*                        name: challenge.name.length > 15 ? challenge.name.substring(0, 15) + '...' : challenge.name,*/}
                        {/*                        completionRate: challenge.completionRate || 0,*/}
                        {/*                        fullName: challenge.name*/}
                        {/*                    })) : []}*/}
                        {/*                    margin={{ top: 10, right: 10, left: 10, bottom: 40 }}*/}
                        {/*                >*/}
                        {/*                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />*/}
                        {/*                    <XAxis*/}
                        {/*                        dataKey="name"*/}
                        {/*                        tick={{ fill: '#4b5563', fontSize: 12 }}*/}
                        {/*                        angle={-45}*/}
                        {/*                        textAnchor="end"*/}
                        {/*                        height={70}*/}
                        {/*                    />*/}
                        {/*                    <YAxis*/}
                        {/*                        domain={[0, 100]}*/}
                        {/*                        tick={{ fill: '#4b5563', fontSize: 12 }}*/}
                        {/*                        tickFormatter={(tick) => `${tick}%`}*/}
                        {/*                    />*/}
                        {/*                    <Tooltip content={<CustomTooltip />} />*/}
                        {/*                    <Bar*/}
                        {/*                        dataKey="completionRate"*/}
                        {/*                        fill={chartColors.completion}*/}
                        {/*                        radius={[4, 4, 0, 0]}*/}
                        {/*                        barSize={40}*/}
                        {/*                        animationDuration={1500}*/}
                        {/*                        animationEasing="ease-out"*/}
                        {/*                    />*/}
                        {/*                </BarChart>*/}
                        {/*            </ResponsiveContainer>*/}
                        {/*        )}*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Reports Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Reports Received</h2>
                            <div className="h-72">
                                {isLoadingReports ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p>Loading chart data...</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={Array.isArray(reportCountsData) ? reportCountsData.map(item => ({
                                                name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
                                                reports: item.reportCount || 0,
                                                fullName: item.name
                                            })) : []}
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
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Member Participation */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Member Participation</h2>
                        <div className="h-72">
                            {isLoadingParticipation ? (
                                <div className="flex items-center justify-center h-full">
                                    <p>Loading chart data...</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={Array.isArray(memberParticipationData) ? memberParticipationData.map(item => ({
                                            name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
                                            members: item.members || 0,
                                            fullName: item.name
                                        })) : []}
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
                            )}
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
                            {isLoadingChallenges ? (
                                <div className="flex items-center justify-center py-10">
                                    <p>Loading challenges data...</p>
                                </div>
                            ) : (
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left">Challenge Name</th>
                                        <th className="py-3 px-4 text-left">Category</th>
                                        <th className="py-3 px-4 text-left">Members</th>
                                        <th className="py-3 px-4 text-left">Reports</th>
                                        <th className="py-3 px-4 text-left">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {Array.isArray(createdChallengesData) && createdChallengesData.map((challenge) => (
                                        <tr
                                            key={challenge.id}
                                            className={`cursor-pointer hover:bg-gray-50 ${selectedChallenge === challenge.id ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleRowClick(challenge)}
                                        >
                                            <td className="py-3 px-4">{challenge.name}</td>
                                            <td className="py-3 px-4">{challenge.category}</td>
                                            <td className="py-3 px-4">{challenge.members}</td>
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
                                                  challenge.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                              }`}>
                                                {challenge.status}
                                              </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!Array.isArray(createdChallengesData) || createdChallengesData.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="py-6 text-center text-gray-500">
                                                No challenges found.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className={`px-4 py-2 mr-2 rounded ${page === 0 ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={!data?.hasNext}
                                className={`px-4 py-2 rounded ${!data?.hasNext ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeStats;