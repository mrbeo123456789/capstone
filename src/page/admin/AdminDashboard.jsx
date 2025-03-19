import React, { useState } from "react";
import Charts from "./Charts";
import ExtraCharts from "./ExtraCharts";
import ReportsAndMembers from "./ReportsAndMembers";
import ChallengeAndEvidence from "./ChallengeAndEvidence";
import { FaPlus, FaChartBar, FaUsers, FaClipboardList, FaTrophy, } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <>
                        {/* Dashboard View with Combined Charts in Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Card 1 - Main Charts */}
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <h2 className="text-xl font-bold mb-4">Overview Stats</h2>
                                {Charts && <Charts />}
                            </div>

                            {/* Card 2 - Additional Charts */}
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <h2 className="text-xl font-bold mb-4">Performance Metrics</h2>
                                {ExtraCharts && <ExtraCharts />}
                            </div>
                        </div>

                        {/* Summary Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <h3 className="font-bold text-lg mb-2">Total Members</h3>
                                <p className="text-2xl font-bold text-blue-400">1,248</p>
                                <p className="text-green-400 text-sm">+12% this month</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <h3 className="font-bold text-lg mb-2">Active Challenges</h3>
                                <p className="text-2xl font-bold text-purple-400">56</p>
                                <p className="text-green-400 text-sm">+8% from last week</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <h3 className="font-bold text-lg mb-2">Pending Reports</h3>
                                <p className="text-2xl font-bold text-red-400">23</p>
                                <p className="text-yellow-400 text-sm">Action needed</p>
                            </div>
                        </div>
                    </>
                );
            case "reports":
                return (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">User Reports</h2>
                        {ReportsAndMembers && <ReportsAndMembers />}
                    </div>
                );
            case "challenges":
                return (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Challenges & Evidence</h2>
                        {ChallengeAndEvidence && <ChallengeAndEvidence />}
                    </div>
                );
            default:
                return <div>Select a tab to view content</div>;
        }
    };

    return (
        <div className="flex bg-gray-900 min-h-screen text-white">
            {/* Side Navigation */}
            <div className="w-16 md:w-64 bg-gray-800 border-r border-gray-700">
                <div className="p-4 font-bold text-xl hidden md:block">Admin Panel</div>
                <div className="mt-8">
                    <NavLink
                        to="/admin/dashboard"
                        className={`flex items-center p-4 ${activeTab === "dashboard" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                        onClick={() => setActiveTab("dashboard")}
                    >
                        <FaChartBar className="mr-3" />
                        <span className="hidden md:inline">Dashboard</span>
                    </NavLink>
                    <NavLink
                        to="/admin/reports"
                        className={`flex items-center p-4 ${activeTab === "reports" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                        onClick={() => setActiveTab("reports")}
                    >
                        <FaClipboardList className="mr-3" />
                        <span className="hidden md:inline">Reports & Members</span>
                    </NavLink>
                    <NavLink
                        to="/admin/challenges"
                        className={`flex items-center p-4 ${activeTab === "challenges" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                        onClick={() => setActiveTab("challenges")}
                    >
                        <FaTrophy className="mr-3" />
                        <span className="hidden md:inline">Challenges & Evidence</span>
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className="flex items-center p-4 hover:bg-gray-700"
                    >
                        <FaUsers className="mr-3" />
                        <span className="hidden md:inline">User Management</span>
                    </NavLink>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-5">
                {/* Header/Title Bar */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {activeTab === "dashboard" && "Admin Dashboard"}
                        {activeTab === "reports" && "Reports & Members"}
                        {activeTab === "challenges" && "Challenges & Evidence"}
                    </h1>
                    <div className="flex space-x-2">
                        <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                            Export Data
                        </button>
                        <NavLink to="/admin/settings" className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
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
                to="/admin/challenges/new"
                className="fixed bottom-10 right-10 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 flex items-center justify-center"
            >
                <FaPlus size={24} />
                <span className="ml-2 hidden md:inline">New Challenge</span>
            </NavLink>
        </div>
    );
};

export default AdminDashboard;