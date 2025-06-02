import { useState, useEffect } from "react";
import { FaSearch, FaUserMinus, FaCrown } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useGetGroupRankingQuery } from "../../service/groupService";
import { useGetCurrentMemberIdQuery } from "../../service/memberService";
import clsx from "clsx";

const MemberTable = ({
                         groupId,
                         isHost = true,
                         onKick,
                         onAfterKick,
                         searchTerm,
                         setSearchTerm,
                         resetTable = false,
                         onResetHandled = () => {},
                     }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const { t } = useTranslation();
    const { data: currentMemberData } = useGetCurrentMemberIdQuery();
    const currentMemberId = currentMemberData;

    // Member list with pagination
    const { data, isLoading, refetch } = useGetGroupRankingQuery(
        { groupId, keyword: searchTerm, page: currentPage, size: 4 },
        { skip: !groupId }
    );
    const members = data?.content || [];
    const totalPages = data?.totalPages || 0;

    // Top 3 logic (from first page)
    const {
        data: top3Data,
        isLoading: isLoadingTop3,
    } = useGetGroupRankingQuery(
        { groupId, keyword: "", page: 0, size: 3 },
        { skip: !groupId }
    );

    const top3 = (top3Data?.content || []).map((u, i) => ({ ...u, rankIndex: i }));
    const adjustedTop3 = [...top3];
    if (adjustedTop3.length === 3) {
        // Swap Top 1 to center
        [adjustedTop3[0], adjustedTop3[1], adjustedTop3[2]] = [
            adjustedTop3[1], // 🥈 left
            adjustedTop3[0], // 🥇 center
            adjustedTop3[2], // 🥉 right
        ];
    }

    useEffect(() => {
        if (resetTable) {
            setCurrentPage(0);
            onResetHandled();
        }
    }, [resetTable, onResetHandled]);

    const handleKick = async (memberId) => {
        if (!onKick || typeof onKick !== "function") return;
        await onKick(memberId);
        setCurrentPage(0);
        await onAfterKick?.();
        await refetch();
    };

    if (isLoading || isLoadingTop3) {
        return <div className="text-center text-gray-500 py-10">{t("common.loading")}</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full mx-auto min-h-[625px]">
            {/* 🏆 Top Podium */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-6 text-orange-600">
                    <FaCrown className="inline mr-2 text-yellow-500" /> {t("member.top3")}
                </h2>
                <div className="flex justify-center items-end gap-6 min-h-[300px]">
                    {adjustedTop3.map((user, index) => {
                        const rank = user.rankIndex;
                        const heightClass = ["h-40", "h-28", "h-20"][rank];
                        const bgColor = ["bg-yellow-400", "bg-gray-300", "bg-orange-300"][rank];
                        const borderClass = rank === 0 ? "border-4 border-yellow-400" : "border-2 border-gray-300";
                        const sizeClass = rank === 0 ? "w-20 h-20" : "w-16 h-16";
                        const rankLabel = ["🥇", "🥈", "🥉"][rank];
                        const isCurrentUser = String(user.memberId) === String(currentMemberId);

                        return (
                            <div
                                key={user.memberId}
                                className="flex flex-col items-center hover:scale-105 transition duration-300"
                            >
                                <div className="relative">
                                    <img
                                        src={user.avatar || "https://via.placeholder.com/150"}
                                        alt={user.name || t("member.user")}
                                        className={`${sizeClass} rounded-full mb-2 ${borderClass} shadow-sm`}
                                    />
                                    <span className="absolute -top-3 -right-3 bg-white rounded-full shadow px-2 py-0.5 text-xs font-bold">
                                        {rankLabel}
                                    </span>
                                </div>
                                <div
                                    className={`${bgColor} w-16 ${heightClass} rounded-t-lg flex items-end justify-center text-white text-lg font-bold shadow-inner`}
                                >
                                    #{rank + 1}
                                </div>
                                <p className="mt-1 font-semibold text-center">
                                    {user.name} {isCurrentUser && <span className="text-sm text-gray-400">({t("member.you")})</span>}
                                </p>
                                <p className="text-sm text-gray-600 text-center">⭐ {user.totalStars} {t("member.stars")}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 📋 Ranking List */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300">
                <h2 className="text-xl font-bold text-center mb-4">{t("member.topRanking")}</h2>

                {/* Search */}
                <div className="mb-4 flex items-center border border-gray-300 rounded px-2 py-1">
                    <FaSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder={t("member.searchUser")}
                        className="w-full outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                    />
                </div>

                {/* Members */}
                <div className="space-y-4">
                    {members.map((user) => {
                        const showKick = isHost && String(user.memberId) !== String(currentMemberId);
                        const isCurrentUser = String(user.memberId) === String(currentMemberId);

                        return (
                            <div
                                key={user.memberId}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user.avatar || "https://via.placeholder.com/150"}
                                        alt={user.name || t("member.user")}
                                        className="w-12 h-12 rounded-full transition-transform hover:scale-105"
                                    />
                                    <div>
                                        <p className="font-semibold">
                                            {user.name} {isCurrentUser && <span className="text-sm text-gray-400">({t("member.you")})</span>}
                                        </p>
                                        <p className="text-sm text-gray-600">{t("member.totalStars")}: {user.totalStars}</p>
                                    </div>
                                </div>

                                {showKick && (
                                    <button
                                        onClick={() => handleKick(user.memberId)}
                                        className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 rounded-full p-2"
                                        title={t("member.kickMember")}
                                    >
                                        <FaUserMinus />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={clsx(
                                "px-3 py-1 rounded",
                                currentPage === i
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MemberTable;
