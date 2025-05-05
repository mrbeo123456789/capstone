import { useState } from "react";
import { useTranslation } from "react-i18next";
import ChallengeStatistic from "./ChallengeStatistic.jsx";
import MemberAndEvidenceManagement from "../admin/list/EvidenceList.jsx";

const HostEvidenceManagement = ({ challengeId }) => {
    const { t } = useTranslation();
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
                    📊 {showStatistics ? t("hostEvidence.hideStats") : t("hostEvidence.showStats")}
                </button>
                <button
                    onClick={() => setShowManagementPanel(!showManagementPanel)}
                    className={`px-4 py-2 font-semibold rounded shadow ${
                        showManagementPanel
                            ? "bg-green-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                >
                    🧑‍🤝‍🧑 {showManagementPanel ? t("hostEvidence.hidePanel") : t("hostEvidence.showPanel")}
                </button>
            </div>

            {showStatistics && <ChallengeStatistic challengeId={challengeId} />}
            {showManagementPanel && <MemberAndEvidenceManagement challengeId={challengeId} />}
        </div>
    );
};

export default HostEvidenceManagement;