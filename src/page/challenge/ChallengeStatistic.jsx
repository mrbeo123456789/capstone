import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

const ChallengeStatistic = ({
                                challengeName,
                                totalParticipants,
                                totalGroups,
                                totalEvidenceSubmitted,
                                approvedEvidence,
                                pendingEvidence,
                                rejectedEvidence,
                                participationRate,
                                completionRate,
                                evidenceSubmittedToday,
                                pendingReviewToday,
                                today,
                            }) => {
    const { t } = useTranslation();

    const pieData = {
        labels: ["Approved", "Pending", "Rejected"],
        datasets: [
            {
                label: "Evidence",
                data: [approvedEvidence, pendingEvidence, rejectedEvidence],
                backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                hoverOffset: 8,
            },
        ],
    };

    return (
        <div className="p-4 space-y-8">
            <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-center"
            >
                {t("Challenge Statistics")}: {challengeName}
            </motion.h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                    { label: "Participants", value: totalParticipants },
                    { label: "Groups", value: totalGroups },
                    {
                        label: "Participation Rate",
                        value: `${(participationRate * 100).toFixed(0)}%`,
                    },
                    {
                        label: "Completion Rate",
                        value: `${(completionRate * 100).toFixed(0)}%`,
                    },
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="p-4 bg-white rounded shadow"
                    >
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-xl font-bold">{item.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Evidence Status Pie Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded shadow p-6"
            >
                <h3 className="text-center font-semibold mb-4">Evidence Status</h3>
                <div className="w-full max-w-sm mx-auto">
                    <Pie data={pieData} />
                </div>
            </motion.div>

            {/* Today's Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                    { label: "Evidence Submitted Today", value: evidenceSubmittedToday },
                    { label: "Pending Reviews Today", value: pendingReviewToday },
                    { label: "Date", value: today },
                    { label: "Total Evidence", value: totalEvidenceSubmitted },
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="p-4 bg-white rounded shadow"
                    >
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-xl font-bold">{item.value}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ChallengeStatistic;
