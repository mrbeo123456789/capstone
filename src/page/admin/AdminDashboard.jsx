import React from "react";
import Charts from "./Charts";
import ExtraCharts from "./ExtraCharts";
import ReportsAndMembers from "./ReportsAndMembers";
import ChallengeAndEvidence from "./ChallengeAndEvidence";
import { FaPlus } from "react-icons/fa";

const AdminDashboard = () => {
    return (
        <div className="flex bg-gray-900 min-h-screen text-white">
            <div className="flex flex-col w-full p-5">

                {/* First Row: New Members & Challenge Pie Chart */}
                {Charts && <Charts />}

                {/* Second Row: Members Chart, Summary, New Challenges */}
                {ExtraCharts && <ExtraCharts />}

                {/* Third Row: Reports & Members Table */}
                {ReportsAndMembers && <ReportsAndMembers />}

                {/* Last Row: Challenge & Evidence Table */}
                {ChallengeAndEvidence && <ChallengeAndEvidence />}

                {/* Floating Create Challenge Button */}
                <button className="fixed bottom-10 right-10 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700">
                    <FaPlus size={24} />
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
