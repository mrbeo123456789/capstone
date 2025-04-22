import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CompletedChallengeCard = ({ challenge, index }) => {
    const navigate = useNavigate();
    const image = challenge.banner ?? challenge.picture;
    const endDate = challenge.endDate
        ? new Date(challenge.endDate).toLocaleDateString()
        : "Unknown";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="cursor-pointer min-w-[175px] max-w-[175px] max-h-[230px] border rounded-lg flex flex-col items-center relative flex-shrink-0 hover:shadow-lg transition"
            onClick={() => navigate(`/challenges/joins/detail/${challenge.id}`)}
        >
            {/* Image */}
            <div className="relative w-full h-24 mb-2">
                <img
                    src={image || "https://via.placeholder.com/300x200"}
                    alt={challenge.name}
                    className="w-full h-full object-cover rounded"
                />
                {challenge.role === "HOST" && (
                    <span className="absolute top-2 left-2 text-yellow-400 text-xl drop-shadow-md">👑</span>
                )}
            </div>

            {/* Name */}
            <div className="flex items-center justify-center gap-1 mb-1 w-full px-2">
                <p className="font-medium text-center truncate">{challenge.name}</p>
            </div>

            {/* End date */}
            <div className="text-gray-500 text-xs mb-1">
                🗓 Ended: {endDate}
            </div>

            {/* Role */}
            <div className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mt-auto mb-2 capitalize">
                {challenge.role.toLowerCase()}
            </div>
        </motion.div>
    );
};

export default CompletedChallengeCard;