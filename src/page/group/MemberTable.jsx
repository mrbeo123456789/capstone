import { useState, useEffect } from "react";
import { FaSearch, FaUserMinus, FaCrown } from "react-icons/fa";
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

    const { data: currentMemberData } = useGetCurrentMemberIdQuery();
    const currentMemberId = currentMemberData;
    const { data, isLoading, refetch } = useGetGroupRankingQuery(
        { groupId, keyword: searchTerm, page: currentPage, size: 4 },
        { skip: !groupId }
    );

    const members = data?.content || [];
    const totalPages = data?.totalPages || 0;
    const top3 = members.slice(0, 3);

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

    if (isLoading) {
        return <div className="text-center text-gray-500 py-10">Loading members...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full mx-auto min-h-[625px]">
            {/* 🏆 Top Podium */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-6 text-orange-600">
                    <FaCrown className="inline mr-2 text-yellow-500" /> Top 3 Active Members
                </h2>
                <div className="flex justify-center items-end gap-6 min-h-[300px]">
                    {top3.map((user, index) => {
                        const heightClass = ["h-40", "h-28", "h-20"][index] || "h-20";
                        const bgColor = ["bg-yellow-400", "bg-gray-300", "bg-orange-300"][index] || "bg-gray-200";
                        const borderClass = index === 0 ? "border-4 border-yellow-400" : "border-2 border-gray-300";
                        const sizeClass = index === 0 ? "w-20 h-20" : "w-16 h-16";
                        const rankLabel = ["🥇", "🥈", "🥉"][index];

                        const isCurrentUser = String(user.memberId) === String(currentMemberId);

                        return (
                            <div
                                key={user.memberId}
                                className="flex flex-col items-center hover:scale-105 transition duration-300"
                            >
                                <div className="relative">
                                    <img
                                        src={user.avatar || "https://via.placeholder.com/150"}
                                        alt={user.name || "User"}
                                        className={`${sizeClass} rounded-full mb-2 ${borderClass} shadow-sm`}
                                    />
                                    <span className="absolute -top-3 -right-3 bg-white rounded-full shadow px-2 py-0.5 text-xs font-bold">
                                    {rankLabel}
                                </span>
                                </div>
                                <div
                                    className={`${bgColor} w-16 ${heightClass} rounded-t-lg flex items-end justify-center text-white text-lg font-bold shadow-inner`}
                                >
                                    #{index + 1}
                                </div>
                                <p className="mt-1 font-semibold text-center">
                                    {user.name} {isCurrentUser && <span className="text-sm text-gray-400">(You)</span>}
                                </p>
                                <p className="text-sm text-gray-600 text-center">⭐ {user.totalStars} Stars</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 📋 Ranking List */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300">
                <h2 className="text-xl font-bold text-center mb-4">Top Ranking</h2>

                {/* Search box */}
                <div className="mb-4 flex items-center border border-gray-300 rounded px-2 py-1">
                    <FaSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search user..."
                        className="w-full outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(0);
                        }}
                    />
                </div>

                {/* Member List */}
                <div className="space-y-4">
                    {members.map((user) => {
                        const showKick = isHost && String(user.memberId) !== String(currentMemberId);
                        const isCurrentUser = String(user.memberId) === String(currentMemberId);

                        console.log(
                            `%c[Debug Kick Icon] user.name = ${user.name} | currentMemberId = ${currentMemberId}, user.memberId = ${user.memberId}, showKick = ${showKick}`,
                            "color: orange; font-weight: bold;"
                        );

                        return (
                            <div
                                key={user.memberId}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user.avatar || "https://via.placeholder.com/150"}
                                        alt={user.name || "User"}
                                        className="w-12 h-12 rounded-full transition-transform hover:scale-105"
                                    />
                                    <div>
                                        <p className="font-semibold">
                                            {user.name} {isCurrentUser && <span className="text-sm text-gray-400">(You)</span>}
                                        </p>
                                        <p className="text-sm text-gray-600">Total Stars: {user.totalStars}</p>
                                    </div>
                                </div>

                                {/* 🔐 Không hiển thị nút kick nếu là chính mình */}
                                {showKick && (
                                    <button
                                        onClick={() => handleKick(user.memberId)}
                                        className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 rounded-full p-2"
                                        title="Kick Member"
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
