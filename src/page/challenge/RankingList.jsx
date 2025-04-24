import { useState } from "react";
import {
    FaStar, FaStarHalfAlt, FaRegStar, FaSearch
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import {
    useGetTop3ProgressRankingQuery,
    useGetChallengeStarLeaderboardQuery
} from "../../service/rankingService";
import { useTranslation } from "react-i18next";

const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars.push(<FaStar key={i} className="text-yellow-400" />);
        else if (i - 0.5 === rating) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        else stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }
    return stars;
};

const RankingList = () => {
    const { t } = useTranslation();
    const { id: challengeId } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Queries
    const { data: top3 = [] } = useGetTop3ProgressRankingQuery(challengeId);
    const {
        data: starData = { content: [], totalPages: 0 },
        isLoading: isStarLoading
    } = useGetChallengeStarLeaderboardQuery({ challengeId, page: currentPage - 1, size: 5 });

    const filtered = starData.content.filter(user =>
        user.memberName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = starData.totalPages || 1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full mx-auto min-h-[625px]">
            {/* Top 3 Podium */}
            <div className="flex justify-between flex-col bg-white p-6 rounded-lg shadow-md min-h-80">
                <h2 className="text-xl font-bold text-center mb-4">{t('rankingList.top3Progress')}</h2>
                <div className="flex justify-center space-x-6 h-full">
                    {top3.length > 0 ? top3.map((user, i) => (
                        <div key={user.memberId} className="text-center h-full content-end">
                            <div className={`rounded-t-lg w-16 flex items-end justify-center pb-1 ${i === 0 ? "bg-yellow-400 h-3/4" : "bg-gray-300 h-" + (3 - i) * 25 + "/100"}`}>
                                {user.rank}
                            </div>
                            <p>{user.memberName}</p>
                            <p className="text-sm text-gray-600">{t('rankingList.rank')}: {user.rank}</p>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500">{t('rankingList.noRankingData')}</p>
                    )}
                </div>
            </div>

            {/* Star Leaderboard */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-4">{t('rankingList.members')}</h2>
                <div className="mb-4 flex items-center border border-gray-300 rounded px-2 py-1">
                    <FaSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder={t('rankingList.searchPlaceholder')}
                        className="w-full outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    {isStarLoading ? (
                        <p className="text-center">{t('rankingList.loadingStarLeaderboard')}</p>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-gray-500">{t('rankingList.noMembersFound')}</p>
                    ) : (
                        filtered.map((user, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded p-3 shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <img src={user.avatar} alt={user.memberName} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{user.memberName}</p>
                                        <p className="text-sm text-gray-600">{t('rankingList.avgStars')}: {user.averageStar?.toFixed(2) || 0}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-1">{renderStars(user.averageStar)}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    {currentPage < totalPages && (
                        <button onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
                            &gt;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RankingList;