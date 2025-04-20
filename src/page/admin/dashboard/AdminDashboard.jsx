import { useState } from "react";
import Charts from "./Charts.jsx";
import { FaPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import Navbar from "../../navbar/AdminNavbar.jsx";
import { useGetSummaryQuery } from "../../../service/adminService.js"; // Import the RTK Query hook

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Fetch summary data from API
    const { data: summaryData, isLoading, isError } = useGetSummaryQuery();

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <>
                        {/* Summary Cards Row - Using API data */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {isLoading ? (
                                // Loading state
                                Array(3).fill(0).map((_, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-gray-300 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                ))
                            ) : isError ? (
                                // Error state
                                <div className="col-span-3 bg-red-50 p-6 rounded-lg border border-red-200 text-red-700">
                                    <h3 className="font-bold text-lg mb-2">Error Loading Data</h3>
                                    <p>Unable to fetch dashboard summary. Please try again later.</p>
                                </div>
                            ) : (
                                // Data loaded successfully
                                <>
                                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                                        <h3 className="font-bold text-lg mb-2 text-gray-800">Total Members</h3>
                                        <p className="text-3xl font-bold text-blue-600">{summaryData?.totalMembers.toLocaleString()}</p>
                                        <p className={`text-sm mt-2 ${summaryData?.memberGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {summaryData?.memberGrowth >= 0 ? '+' : ''}{summaryData?.memberGrowth}% this month
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
                                        <h3 className="font-bold text-lg mb-2 text-gray-800">Active Challenges</h3>
                                        <p className="text-3xl font-bold text-purple-600">{summaryData?.activeChallenges}</p>
                                        <p className={`text-sm mt-2 ${summaryData?.challengeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {summaryData?.challengeGrowth >= 0 ? '+' : ''}{summaryData?.challengeGrowth}% from last week
                                        </p>
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
                                        <h3 className="font-bold text-lg mb-2 text-gray-800">Pending Reports</h3>
                                        <p className="text-3xl font-bold text-red-600">{summaryData?.pendingReports}</p>
                                        {summaryData?.pendingReports > 0 ? (
                                            <p className="text-yellow-600 text-sm mt-2">Action needed</p>
                                        ) : (
                                            <p className="text-green-600 text-sm mt-2">All clear</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Dashboard View with Stacked Charts in Cards */}
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            {/* Card 1 - Main Charts */}
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Overview Stats</h2>
                                {Charts && <Charts />}
                            </div>
                        </div>
                    </>
                );
            default:
                return <div className="text-gray-600">Select a tab to view content</div>;
        }
    };

    return (
        <div className="flex bg-orange-50 min-h-screen text-gray-800">
            {/* Side Navigation */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Collapsible */}
                <div className={`transition-all duration-300  ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Navbar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}/>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col p-6">
                    {/* Header/Title Bar */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-orange-200">
                        <h1 className="text-2xl font-bold text-orange-800">
                            {activeTab === "dashboard" && "Admin Dashboard"}
                            {activeTab === "reports" && "Reports & Members"}
                            {activeTab === "challenges" && "Challenges & Evidence"}
                        </h1>
                        <div className="flex space-x-3">
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition duration-200 shadow-sm">
                                Export Data
                            </button>
                            <NavLink to="/admin/settings"
                                     className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition duration-200 shadow-sm">
                                Settings
                            </NavLink>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>

                {/* Floating Action Button for creating challenges */}
                <NavLink
                    to="/admin/challenge/create"
                    className="fixed bottom-10 right-10 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition duration-200 flex items-center justify-center"
                >
                    <FaPlus size={20}/>
                    <span className="ml-2 hidden md:inline font-medium">New Challenge</span>
                </NavLink>
            </div>
        </div>
    );
};
export default AdminDashboard;