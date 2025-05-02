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
    let fullStars = Math.floor(rating);
    console.log("Full statr", fullStars)// full stars (ex: 3 from 3.8)
    const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75; // half if between 0.25 - 0.75
    console.log("hasHalfStar", hasHalfStar)
    const totalStars = hasHalfStar ? fullStars + 1 : Math.round(rating);  // total stars filled (full + half)
    console.log("totalStars", totalStars)

    for (let i = 1; i <= 5; i++) {
        if (!hasHalfStar) {
            fullStars = totalStars;
        }
        if (i <= fullStars) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
            stars.push(<FaRegStar key={i} className="text-gray-300" />);
        }
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
                                    <img
                                        src={user.avatar || "https://firebasestorage.googleapis.com/v0/b/bookstore-f9ac2.appspot.com/o/avatar%2Fillustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg?alt=media&token=f5c7e08a-9e7d-467f-8eff-3c321824edcd"}
                                        alt={user.memberName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{user.memberName}</p>
                                        <p className="text-sm text-gray-600">
                                            {t('rankingList.avgStars')}: {((user.averageStar || 0)/10).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-1">{renderStars((user.averageStar || 0) / 10)}</div>
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