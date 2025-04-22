import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ChallengeStatistic = ({ totalParticipants = 25, completed = 15, notCompleted = 10 }) => {
    const { t } = useTranslation();

    const barData = {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
        datasets: [
            {
                label: t("challengeStatistic.completed"),
                data: [5, 7, 10, 8, 12],
                backgroundColor: "#3b82f6",
                borderRadius: 6,
            },
        ],
    };

    const donutData = {
        labels: [t("challengeStatistic.completed"), t("challengeStatistic.notCompleted")],
        datasets: [
            {
                data: [completed, notCompleted],
                backgroundColor: ["#10b981", "#f59e0b"],
                hoverOffset: 10,
            },
        ],
    };

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">{t("challengeStatistic.total")}: {totalParticipants}</h2>
                <p className="text-sm text-gray-500 mb-4">{t("challengeStatistic.dailyOverview")}</p>
                <Bar data={barData} options={{
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: "#1f2937",
                            titleColor: "#fff",
                            bodyColor: "#d1d5db"
                        }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }} />
            </div>

            <div className="flex flex-col items-center justify-center">
                <h2 className="text-lg font-bold text-gray-800 mb-2">{t("challengeStatistic.completionRate")}</h2>
                <div className="w-48 h-48">
                    <Doughnut data={donutData} options={{
                        plugins: {
                            legend: { position: 'bottom', labels: { color: "#4b5563" } },
                            tooltip: {
                                backgroundColor: "#1f2937",
                                titleColor: "#fff",
                                bodyColor: "#d1d5db"
                            }
                        }
                    }} />
                </div>
            </div>
        </motion.div>
    );
};

export default ChallengeStatistic;
