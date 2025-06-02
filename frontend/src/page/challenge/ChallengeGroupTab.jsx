import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetTop3GroupProgressQuery, useGetGroupStarRatingsByChallengeQuery } from "../../service/rankingService";
import GroupPodium from "./GroupPodium.jsx";
import ChallengeGroup from "./ChallengeGroup.jsx";

const ChallengeGroupTab = () => {
    const { id: challengeId } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);

    const { data: top3Groups = [], isLoading: isTop3Loading } = useGetTop3GroupProgressQuery(challengeId);
    const {
        data: groupPageData,
        isLoading: isGroupLoading,
    } = useGetGroupStarRatingsByChallengeQuery({ challengeId, page: 0 });

    const filtered = (groupPageData?.content || []).filter(group =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageSize = 4;
    const paginated = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    return (
        <div className="p-6 w-full mx-auto min-h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GroupPodium topGroups={top3Groups} isLoading={isTop3Loading} />
                <ChallengeGroup
                    groups={paginated}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    isLoading={isGroupLoading}
                />
            </div>
        </div>
    );
};

export default ChallengeGroupTab;
