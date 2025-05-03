import { useState } from "react";
import ChallengeStatistic from "./ChallengeStatistic.jsx";
import MemberAndEvidenceManagement from "../admin/list/EvidenceList.jsx";

const HostEvidenceManagement = ({ challengeId }) => {
    const [showStatistics, setShowStatistics] = useState(false);
    const [showManagementPanel, setShowManagementPanel] = useState(false);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setShowStatistics(!showStatistics)}
                    className={`px-4 py-2 font-semibold rounded shadow ${
                        showStatistics
                            ? "bg-blue-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                    📊 {showStatistics ? "Hide" : "Show"} Challenge Statistics
                </button>
                <button
                    onClick={() => setShowManagementPanel(!showManagementPanel)}
                    className={`px-4 py-2 font-semibold rounded shadow ${
                        showManagementPanel
                            ? "bg-green-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                >
                    🧑‍🤝‍🧑 {showManagementPanel ? "Hide" : "Show"} Member & Evidence
                </button>
            </div>

            {showStatistics && <ChallengeStatistic challengeId={challengeId} />}
            {showManagementPanel && <MemberAndEvidenceManagement challengeId={challengeId} />}
        </div>
    );
};

export default HostEvidenceManagement;
