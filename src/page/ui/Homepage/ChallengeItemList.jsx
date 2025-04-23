import React from "react";
import {
    FaBan,
    FaBriefcase,
    FaSpa,
    FaBook,
    FaRunning,
    FaTint,
    FaPaw,
    FaClipboardCheck,
    FaTasks,
    FaCheck,
    FaClock
} from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useGetTasksForDateQuery } from "../../../service/evidenceService.js"; // Adjust path as needed

// Map for icons based on challenge name keywords
const getIconForChallenge = (challengeName) => {
    if (!challengeName) return <FaTasks />;

    const name = challengeName.toLowerCase();

    if (name.includes("water") || name.includes("drink")) return <FaTint />;
    if (name.includes("read") || name.includes("book")) return <FaBook />;
    if (name.includes("run") || name.includes("exercise")) return <FaRunning />;
    if (name.includes("meditate") || name.includes("yoga")) return <FaSpa />;
    if (name.includes("work") || name.includes("meeting")) return <FaBriefcase />;
    if (name.includes("dog") || name.includes("pet") || name.includes("walk")) return <FaPaw />;
    if (name.includes("alcohol") || name.includes("no") || name.includes("quit")) return <FaBan />;

    // Default icon
    return <FaClipboardCheck />;
};

// Helper function to determine status color
const getStatusColor = (evidenceStatus) => {
    switch (evidenceStatus) {
        case "COMPLETED":
            return "text-green-500";
        case "PENDING":
            return "text-yellow-500";
        case "REJECTED":
            return "text-red-500";
        default:
            return "text-gray-500";
    }
};

// Helper function to get readable status text
const getStatusText = (evidenceStatus) => {
    switch (evidenceStatus) {
        case "COMPLETED":
            return "Completed";
        case "PENDING":
            return "Pending";
        case "REJECTED":
            return "Rejected";
        case "IN_REVIEW":
            return "In Review";
        default:
            return "Not Started";
    }
};

const ChallengeItemList = ({ selectedDate }) => {
    // Convert the selectedDate (dayjs object) to ISO format string (YYYY-MM-DD)
    const dateString = selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined;

    // Fetch tasks for the selected date
    const { data: tasks, isLoading, error } = useGetTasksForDateQuery(dateString);

    if (isLoading) {
        return (
            <div className="w-full max-w-md mx-auto mt-6 text-center">
                <p className="text-gray-500">Loading tasks...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-md mx-auto mt-6 text-center">
                <p className="text-red-500">Error loading tasks. Please try again.</p>
            </div>
        );
    }

    if (!tasks || tasks.length === 0) {
        return (
            <div className="w-full max-w-md mx-auto mt-6 text-center">
                <p className="text-gray-500">No tasks for this day.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-3 mt-6">
            {tasks.map((item, idx) => (
                <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3"
                >
                    {/* Left section: Icon */}
                    <div className="flex items-center space-x-4">
                        <div className="bg-gray-100 text-xl p-3 rounded-full text-white"
                             style={{
                                 backgroundColor: item.evidenceStatus === "COMPLETED" ? "#7756d6" : "#ef5da8",
                             }}
                        >
                            {getIconForChallenge(item.challengeName)}
                        </div>
                        {/* Title & Meta */}
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900">{item.challengeName}</p>
                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-2">
                                {item.totalReviewAssigned > 0 && (
                                    <span>
                                        <FaCheck className="inline mr-1" />
                                        {item.reviewCompleted}/{item.totalReviewAssigned} Reviews
                                    </span>
                                )}
                                <span className={getStatusColor(item.evidenceStatus)}>
                                    {getStatusText(item.evidenceStatus)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right section: Status */}
                    {item.evidenceStatus === "COMPLETED" ? (
                        <div className="text-green-500 text-xl">✔️</div>
                    ) : item.evidenceStatus === "IN_REVIEW" ? (
                        <div className="text-yellow-500 text-xl">
                            <FaClock />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-xl">
                            <BsThreeDots />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ChallengeItemList;