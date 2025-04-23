import {
    Chart as ChartJS,
    BarElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

ChartJS.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

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
                                today
                            }) => {
    const { t } = useTranslation();

    const evidenceData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                label: 'Evidence Status',
                data: [approvedEvidence, pendingEvidence, rejectedEvidence],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderRadius: 4,
                barThickness: 30,
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
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="text-xl font-bold">{totalParticipants}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Groups</p>
                    <p className="text-xl font-bold">{totalGroups}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Participation Rate</p>
                    <p className="text-xl font-bold">{(participationRate * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className="text-xl font-bold">{(completionRate * 100).toFixed(0)}%</p>
                </div>
            </div>

            {/* Evidence Status Bar Chart */}
            <div className="bg-white rounded shadow p-4">
                <h3 className="text-center font-semibold mb-4">Evidence Review Status</h3>
                <Bar
                    data={evidenceData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    precision: 0,
                                },
                            },
                        },
                    }}
                />
            </div>

            {/* Today's Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Evidence Submitted Today</p>
                    <p className="text-xl font-bold">{evidenceSubmittedToday}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Pending Reviews Today</p>
                    <p className="text-xl font-bold">{pendingReviewToday}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-xl font-bold">{today}</p>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <p className="text-sm text-gray-500">Total Evidence</p>
                    <p className="text-xl font-bold">{totalEvidenceSubmitted}</p>
                </div>
            </div>
        </div>
    );
};

export default ChallengeStatistic;
