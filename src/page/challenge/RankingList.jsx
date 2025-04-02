import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaSearch } from "react-icons/fa";

const rankings = [
    { rank: 1, name: "Nam", image: "https://randomuser.me/api/portraits/men/1.jpg", rating: 5, votes: 100, progress: "20/20" },
    { rank: 2, name: "Nguyễn Duy Anh", image: "https://randomuser.me/api/portraits/men/2.jpg", rating: 4.75, votes: 95, progress: "20/20" },
    { rank: 3, name: "Lê Văn Duy", image: "https://randomuser.me/api/portraits/men/3.jpg", rating: 4.2, votes: 80, progress: "19/20" },
    { rank: 4, name: "Đinh Nam", image: "https://randomuser.me/api/portraits/men/4.jpg", rating: 4.1, votes: 70, progress: "19/20" },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/women/5.jpg", rating: 3.5, votes: 60, progress: "18/20" },
];

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
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 4;
    const filtered = rankings.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filtered.length / usersPerPage);
    const currentUsers = filtered.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full mx-auto">
            {/* Top Active Podium */}
            <div className="flex justify-between flex-col bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-4">Top Active</h2>
                <div className="flex justify-center space-x-6 h-full">
                    <div className="text-center h-full content-end">
                        <div className="bg-gray-300 rounded-t-lg w-16 h-2/4 flex items-end justify-center pb-1">2</div>
                        <p>Hiếu</p>
                        <p className="text-sm text-gray-600">Mark: 90</p>
                    </div>
                    <div className="text-center h-full content-end">
                        <div className="bg-yellow-400 rounded-t-lg w-16 h-3/4 flex items-end justify-center pb-1">1</div>
                        <p>Nam</p>
                        <p className="text-sm text-gray-600">Mark: 120</p>
                    </div>
                    <div className="text-center h-full content-end">
                        <div className="bg-gray-300 rounded-t-lg w-16 h-1/4 flex items-end justify-center pb-1">3</div>
                        <p>Hà</p>
                        <p className="text-sm text-gray-600">Mark: 80</p>
                    </div>
                </div>
            </div>

            {/* Top Ranking List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center mb-4">Top Ranking</h2>
                <div className="mb-4 flex items-center border border-gray-300 rounded px-2 py-1">
                    <FaSearch className="text-gray-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search user..."
                        className="w-full outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="space-y-4">
                    {currentUsers.map((user, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded p-3 shadow-sm">
                            <div className="flex items-center space-x-3">
                                <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-gray-600">Avg stars: {user.rating}</p>
                                    <p className="text-xs text-gray-500">Progress: {user.progress} | Stars: {user.votes} | Rank: {user.rank}/40</p>
                                </div>
                            </div>
                            <div className="flex space-x-1">{renderStars(user.rating)}</div>
                        </div>
                    ))}
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