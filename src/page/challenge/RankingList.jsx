import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaSearch } from "react-icons/fa";

const rankings = [
    { rank: 1, name: "User Name", image: "https://randomuser.me/api/portraits/men/1.jpg", rating: 5, votes: 10 },
    { rank: 2, name: "User Name", image: "https://randomuser.me/api/portraits/women/2.jpg", rating: 4.5, votes: 9 },
    { rank: 3, name: "User Name", image: "https://randomuser.me/api/portraits/men/3.jpg", rating: 4.5, votes: 7 },
    { rank: 4, name: "User Name", image: "https://randomuser.me/api/portraits/women/4.jpg", rating: 4, votes: 6 },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/men/5.jpg", rating: 3.5, votes: 6 },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/men/5.jpg", rating: 3.5, votes: 6 },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/men/5.jpg", rating: 3.5, votes: 6 },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/men/5.jpg", rating: 3.5, votes: 6 },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/men/5.jpg", rating: 3.5, votes: 6 },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/men/5.jpg", rating: 3.5, votes: 6 },
    { rank: 5, name: "User Name", image: "https://randomuser.me/api/portraits/men/5.jpg", rating: 3.5, votes: 6 },
];

const RankingList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (i - 0.5 === rating) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-gray-400" />);
            }
        }
        return stars;
    };

    const filteredRankings = rankings.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRankings.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredRankings.slice(indexOfFirstUser, indexOfLastUser);

    return (
        <div className="mt-6 w-full mx-auto bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4 flex items-center">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search for a user..."
                    className="border border-gray-300 rounded p-2 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="w-full">
                {currentUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-200 py-4 text-lg">
                        <span className="text-gray-700 w-8">{user.rank}</span>
                        <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                        <span className="text-gray-800 font-semibold flex-1">{user.name}</span>
                        <div className="flex space-x-1">{renderStars(user.rating)}</div>
                        <span className="text-gray-600">({user.votes} Votes)</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-4 space-x-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300">
                    Prev
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300">
                    Next
                </button>
            </div>
        </div>
    );
};

export default RankingList;
