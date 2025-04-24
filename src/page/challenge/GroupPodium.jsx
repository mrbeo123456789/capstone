import { FaCrown } from "react-icons/fa";

const GroupPodium = ({ topGroups = [] }) => {
    const heightClass = ["h-40", "h-28", "h-20"];
    const bgColor = ["bg-yellow-400", "bg-gray-300", "bg-orange-300"];
    const rankLabel = ["🥇", "🥈", "🥉"];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-center mb-6 text-orange-600">
                <FaCrown className="inline mr-2 text-yellow-500" /> Top 3 Groups
            </h2>
            <div className="flex justify-center items-end gap-6 min-h-[300px]">
                {topGroups.map((group, index) => (
                    <div key={group.groupId} className="flex flex-col items-center hover:scale-105 transition duration-300">
                        <div className={`w-16 ${heightClass[index]} ${bgColor[index]} rounded-t-lg flex items-end justify-center text-white text-lg font-bold`}>
                            #{index + 1}
                        </div>
                        <p className="mt-2 font-semibold text-center">{group.groupName}</p>
                        <p className="text-sm text-gray-600 text-center">⭐ {group.totalStars} Stars</p>
                        <span className="text-xs text-gray-400 mt-1">👥 {group.memberCount} members</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupPodium;
