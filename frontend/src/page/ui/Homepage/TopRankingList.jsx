import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaSearch } from "react-icons/fa";
import {useGetGlobalRankingQuery} from "../../../service/rankingService.js";

const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars.push(<FaStar key={i} className="text-yellow-400" />);
        else if (i - 0.5 === rating) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        else stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }
    return stars;
};

const TopRankingList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const { data, isLoading, isError } = useGetGlobalRankingQuery({ page: currentPage - 1, size: pageSize });
    const totalPages = data?.totalPages || 1;

    const filteredUsers = (data?.content || []).filter(user =>
        user.memberName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-3 rounded-lg shadow-md h-[410px]">
            <div className="flex items-center border border-gray-300 rounded px-2 py-1 mb-3">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    className="w-full outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <p className="text-center text-sm">Đang tải bảng xếp hạng...</p>
            ) : isError ? (
                <p className="text-center text-sm text-red-500">Lỗi khi tải dữ liệu.</p>
            ) : filteredUsers.length === 0 ? (
                <p className="text-center text-sm text-gray-500">Không tìm thấy người dùng.</p>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user, i) => (
                        <div key={user.memberId || i} className="flex items-center justify-between bg-gray-50 rounded shadow-sm p-2 h-[80px] overflow-hidden">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.avatar || "/default-avatar.png"}
                                    alt={user.memberName}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                                />
                                <div>
                                    <p className="font-semibold">{user.memberName}</p>
                                    <p className="text-sm text-gray-600">Đánh giá: {user.averageStar?.toFixed(2)}</p>
                                    <div className="flex space-x-1">{renderStars(user.averageStar || 0)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        &gt;
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopRankingList;