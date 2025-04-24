import { useState } from "react";
import { Eye, Trash } from "lucide-react";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import { useGetGroupsQuery } from "../../../service/adminService.js";
import { useDeleteGroupMutation } from "../../../service/groupService.js";
import GroupDetailModal from "../detailmodal/GroupDetail.jsx";

const GroupList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const itemsPerPage = 10;

    // Sử dụng query danh sách nhóm từ adminService
    const {
        data: groupsResponse = {},
        isLoading: isLoadingGroups,
        isError: isErrorGroups,
        refetch: refetchGroups,
    } = useGetGroupsQuery({ page: currentPage - 1, size: itemsPerPage, keyword: searchTerm });

    const groups = groupsResponse?.content || [];
    const totalPages = groupsResponse?.totalPages || 1;
    const totalElements = groupsResponse?.totalElements || 0;

    // Mutation delete group
    const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();

    // Hàm mở modal chi tiết nhóm
    const openGroupDetail = (group) => {
        setSelectedGroupId(group.id);
        setShowPopup(true);
    };

    // Hàm đóng modal chi tiết nhóm
    const closeGroupDetail = () => {
        setShowPopup(false);
        setSelectedGroupId(null);
    };

    // Hàm xử lý delete nhóm trực tiếp ở danh sách
    const handleDelete = async (groupId) => {
        if (window.confirm("Are you sure you want to permanently delete this group?")) {
            try {
                const result = await deleteGroup(groupId).unwrap();
                alert("Group deleted successfully!");
                refetchGroups();
            } catch (error) {
                console.error("Error deleting group:", error);
                alert("Failed to delete group.");
            }
        }
    };

    // Hàm định dạng ngày từ dữ liệu backend
    const formatDate = (dateValue) => {
        if (!dateValue) return "Invalid date";

        let dateObj;

        // Xử lý trường hợp dữ liệu là mảng (kiểu cũ)
        if (Array.isArray(dateValue) && dateValue.length >= 3) {
            const [year, month, day] = dateValue;
            dateObj = new Date(year, month - 1, day);
        }
        // Xử lý trường hợp dữ liệu là timestamp hoặc chuỗi ngày tháng
        else {
            try {
                dateObj = new Date(dateValue);
            } catch (error) {
                console.error("Error parsing date:", error);
                return "Invalid date";
            }
        }

        // Kiểm tra xem dateObj có phải là ngày hợp lệ không
        if (isNaN(dateObj.getTime())) {
            return "Invalid date";
        }

        // Format thành dd/mm/yyyy
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Pagination handlers
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Handle search term change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    return (
        <div className="bg-blue-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-blue-100 h-full flex flex-col">
                        {/* Thanh tìm kiếm */}
                        <div className="p-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-yellow-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Searching group ..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách nhóm */}
                        <div className="flex-1 overflow-auto">
                            {isLoadingGroups ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : isErrorGroups ? (
                                <div className="flex justify-center items-center h-64 text-red-500">
                                    <p>Error fetching data. Please try again later.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-100 to-yellow-100 text-blue-700">
                                    <tr>
                                        <th className="p-4 text-left">Group Name</th>
                                        <th className="p-4 text-left">Total Member</th>
                                        <th className="p-4 text-left">Created Date</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {groups.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-gray-500">
                                                Not have any group yet
                                            </td>
                                        </tr>
                                    ) : (
                                        groups.map((group) => (
                                            <tr key={group.id} className="border-b border-blue-50 hover:bg-blue-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200">
                                                            <img
                                                                src={group.avatar || "/api/placeholder/40/40"}
                                                                alt={group.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span
                                                            className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                                                            onClick={() => openGroupDetail(group)}
                                                        >
                                                            {group.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">{group.memberCount}</td>
                                                <td className="p-4 text-gray-600">{formatDate(group.createdAt)}</td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2 justify-center">
                                                        <button
                                                            className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                                                            onClick={() => openGroupDetail(group)}
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                            onClick={() => handleDelete(group.id)}
                                                            disabled={isDeleting}
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="bg-gradient-to-r from-blue-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-blue-100 gap-4">
                            <div className="text-gray-600">
                                Display <span className="font-medium">{groups.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span>{" "}
                                to <span className="font-medium">{(currentPage - 1) * itemsPerPage + groups.length}</span> in total{" "}
                                <span className="font-medium">{totalElements}</span> groups
                            </div>
                            <div className="flex space-x-2 self-center md:self-auto">
                                <button
                                    className="p-2 rounded-md bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="bg-white border border-blue-200 rounded-md px-4 py-2 flex items-center">
                                    <span className="text-blue-600 font-medium">{currentPage}</span>
                                    <span className="mx-1 text-gray-400">/</span>
                                    <span className="text-gray-600">{totalPages}</span>
                                </div>
                                <button
                                    className="p-2 rounded-md bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal chi tiết nhóm */}
            {showPopup && selectedGroupId && (
                <GroupDetailModal
                    groupId={selectedGroupId}
                    onClose={closeGroupDetail}
                    onDisbandSuccess={refetchGroups}
                />
            )}
        </div>
    );
};

export default GroupList;