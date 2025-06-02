import { FaSearch } from "react-icons/fa";

const ChallengeGroup = ({
                            groups = [],
                            currentPage,
                            setCurrentPage,
                            searchTerm,
                            setSearchTerm,
                            totalPages = 1
                        }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-center mb-4">All Group Rankings</h2>

            {/* Search bar */}
            <div className="mb-4 flex items-center border border-gray-300 rounded px-2 py-1">
                <FaSearch className="text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search group..."
                    className="w-full outline-none"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                    }}
                />
            </div>

            {/* Group list */}
            <div className="space-y-4">
                {groups.length === 0 ? (
                    <p className="text-center text-gray-500">No groups found</p>
                ) : (
                    groups.map((group) => (
                        <div
                            key={group.groupId}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded shadow-sm"
                        >
                            {/* Left side: Avatar + name + stars */}
                            <div className="flex items-center gap-3">
                                <img
                                    src={group.picture || "https://via.placeholder.com/48"}
                                    alt={group.groupName}
                                    className="w-12 h-12 rounded-full object-cover border"
                                />
                                <div>
                                    <p className="font-semibold">{group.groupName}</p>
                                    <p className="text-sm text-gray-600">⭐ {group.averageStar?.toFixed(1) ?? "0.0"} Stars</p>
                                </div>
                            </div>

                            {/* Right side: Members count */}
                            <p className="text-xs text-gray-500">👥 {group.memberCount ?? 0} members</p>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-1 rounded ${
                            currentPage === i
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChallengeGroup;
