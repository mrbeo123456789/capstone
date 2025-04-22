import { useState } from "react";
import { useParams } from "react-router-dom";
import GroupPodium from "./GroupPodium.jsx";
import ChallengeGroup from "./ChallengeGroup.jsx"; // ⬅ dùng để hiển thị list nhóm còn lại

const ChallengeGroupTab = () => {
    const { id: challengeId } = useParams(); // Dự phòng cho sau này dùng thật
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);

    // 🧪 Fake Data
    const mockData = {
        content: [
            { groupId: 1, groupName: "Team Rocket", totalStars: 92, memberCount: 5 },
            { groupId: 2, groupName: "Giga Fit", totalStars: 89, memberCount: 7 },
            { groupId: 3, groupName: "Dream Burners", totalStars: 85, memberCount: 4 },
            { groupId: 4, groupName: "Night Runners", totalStars: 82, memberCount: 6 },
            { groupId: 5, groupName: "Alpha Squad", totalStars: 79, memberCount: 8 },
            { groupId: 6, groupName: "Velocity", totalStars: 75, memberCount: 5 },
            { groupId: 7, groupName: "Power League", totalStars: 70, memberCount: 3 },
        ],
        totalPages: 2
    };

    const filtered = mockData.content.filter(group =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const top3 = filtered.slice(0, 3);
    const remaining = filtered.slice(3 + currentPage * 4, 3 + (currentPage + 1) * 4);
    const totalPages = Math.ceil((filtered.length - 3) / 4);

    return (
        <div className="p-6 w-full mx-auto min-h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Podium */}
                <GroupPodium topGroups={top3} />

                {/* Right: List + Search + Pagination */}
                <ChallengeGroup
                    groups={remaining}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            </div>
        </div>
    );
};

export default ChallengeGroupTab;
