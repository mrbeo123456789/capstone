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
                    onClick={() => {
                        setShowStatistics(true);
                        setShowManagementPanel(false);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow"
                >
                    📊 Open Challenge Statistics
                </button>
                <button
                    onClick={() => {
                        setShowManagementPanel(true);
                        setShowStatistics(false);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
                >
                    🧑‍🤝‍🧑 Open Member & Evidence Management
                </button>
            </div>

            {showStatistics && (
                <ChallengeStatistic challengeId={challengeId} />
            )}

            {showManagementPanel && (
                <MemberAndEvidenceManagement challengeId={challengeId} />
            )}
        </div>
    );
};

export default HostEvidenceManagement;