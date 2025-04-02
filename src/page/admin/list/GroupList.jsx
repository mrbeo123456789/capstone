import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Eye, Check, Ban, Search } from "lucide-react";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import { useGetGroupsQuery } from "../../../service/adminService.js"; // Điều chỉnh đường dẫn nếu cần

const GroupList = () => {
    // State quản lý phân trang, tìm kiếm (UI tĩnh), và sidebar
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 10;

    // Gọi API lấy danh sách nhóm theo phân trang (keyword để trống vì chưa xử lý logic search)
    const {
        data: groupsResponse = {},
        isLoading,
        isError,
        refetch,
    } = useGetGroupsQuery({ page: currentPage - 1, size: itemsPerPage, keyword: "" });

    // Giả sử API trả về { content, totalPages, totalElements }
    const groups = groupsResponse?.content || [];
    const totalPages = groupsResponse?.totalPages || Math.ceil((groupsResponse.totalElements || groups.length) / itemsPerPage);

    // Modal chi tiết nhóm
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const openGroupDetail = (group) => {
        setSelectedGroupId(group.id);
        setShowPopup(true);
    };

    const closeGroupDetail = () => {
        setShowPopup(false);
        setSelectedGroupId(null);
    };

    // Xử lý toggle ban cho nhóm (chỉ demo, cần gọi mutation nếu có)
    const handleToggleBan = (groupId) => {
        console.log("Toggled ban status for group:", groupId);
        if (showPopup && selectedGroupId === groupId) {
            setSelectedGroupId(null);
            setTimeout(() => setSelectedGroupId(groupId), 10);
        }
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
    const GroupSearchBar = ({ searchTerm, setSearchTerm }) => (
        <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex flex-col md:flex-row gap-3 justify-between">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhóm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                        <Search size={10} />
                    </div>
                </div>
            </div>
        </div>
    );

    // Modal chi tiết nhóm (giữ giao diện cũ)
    const GroupDetailPopup = ({ groupId, onClose, onToggleBan }) => {
        const selectedGroup = groups.find((g) => g.id === groupId);
        if (!selectedGroup) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                        <p className="text-center text-red-500">Error loading group details.</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">
                            Đóng
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Chi tiết nhóm</h2>
                        <button
                            onClick={onClose}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium"
                        >
                            Đóng
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 flex-shrink-0 mb-4 md:mb-0">
                                <img
                                    src={selectedGroup.avatar}
                                    alt={selectedGroup.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="md:ml-6 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-gray-800">{selectedGroup.name}</h3>
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-blue-100 text-blue-800">
                                    {selectedGroup.members} Members
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <Search className="mr-2" size={18} />
                                    <span className="text-sm font-medium">Tên nhóm</span>
                                </div>
                                <div className="text-gray-800 pl-6">{selectedGroup.name}</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium">Ngày tạo</span>
                                </div>
                                <div className="text-gray-800 pl-6">{selectedGroup.createdAt}</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">Số thành viên</span>
                                </div>
                                <div className="text-gray-800 pl-6">{selectedGroup.maxParticipants}</div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">Trạng thái</span>
                                </div>
                                <div className="flex items-center pl-6">
                                    {!selectedGroup.isBanned ? (
                                        <CheckCircle className="text-green-500 mr-2" size={18} />
                                    ) : (
                                        <XCircle className="text-red-500 mr-2" size={18} />
                                    )}
                                    <span className={`font-medium ${!selectedGroup.isBanned ? "text-green-600" : "text-red-600"}`}>
                                        {!selectedGroup.isBanned ? "Hoạt động" : "Đã bị khóa"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end items-center border-t border-gray-200 space-x-3">
                        <label htmlFor="toggleSwitch" className="relative inline-block w-12 h-6">
                            <input
                                id="toggleSwitch"
                                type="checkbox"
                                className="opacity-0 w-0 h-0"
                                checked={!selectedGroup.isBanned}
                                onChange={() => onToggleBan(selectedGroup.id)}
                            />
                            <span
                                className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                                    !selectedGroup.isBanned ? "bg-red-500" : "bg-green-500"
                                }`}
                            ></span>
                            <span
                                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                                    !selectedGroup.isBanned ? "translate-x-6" : "translate-x-0"
                                }`}
                            ></span>
                        </label>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-red-50 min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                        {/* Thanh tìm kiếm (UI tĩnh) */}
                        <GroupSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                        {/* Hiển thị danh sách nhóm */}
                        <div className="flex-1 overflow-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                                </div>
                            ) : isError ? (
                                <div className="flex justify-center items-center h-64 text-red-500">
                                    <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700">
                                    <tr>
                                        <th className="p-4 text-left">Tên Nhóm</th>
                                        <th className="p-4 text-left">Thành viên</th>
                                        <th className="p-4 text-left">Ngày tạo</th>
                                        <th className="p-4 text-left">Trạng thái</th>
                                        <th className="p-4 text-center">Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {groups.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-4 text-center text-gray-500">
                                                Không có nhóm nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        groups.map((group) => (
                                            <tr key={group.id} className="border-b border-orange-50 hover:bg-orange-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                                                            <img
                                                                src={group.avatar}
                                                                alt={group.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span
                                                            className="font-medium text-orange-600 hover:text-orange-800 cursor-pointer hover:underline"
                                                            onClick={() => openGroupDetail(group)}
                                                        >
                                                                {group.name}
                                                            </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600">{group.members}</td>
                                                <td className="p-4 text-gray-600">{group.createdAt}</td>
                                                <td className="p-4">
                                                    {group.isBanned ? (
                                                        <div className="flex items-center text-red-500">
                                                            <XCircle className="mr-2" size={18} />
                                                            <span className="text-sm font-medium">Đã khóa</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-green-500">
                                                            <CheckCircle className="mr-2" size={18} />
                                                            <span className="text-sm font-medium">Hoạt động</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2 justify-center">
                                                        <button
                                                            className="p-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                                                            onClick={() => openGroupDetail(group)}
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            className={`p-2 rounded-md transition-colors ${
                                                                group.isBanned
                                                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                                            }`}
                                                            onClick={() => handleToggleBan(group.id)}
                                                        >
                                                            {group.isBanned ? <Check size={18} /> : <Ban size={18} />}
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

                        {/* Phân trang */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-orange-100 gap-4">
                            <div className="text-gray-600">
                                Hiển thị <span className="font-medium">{groups.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> đến <span className="font-medium">{(currentPage - 1) * itemsPerPage + groups.length}</span> trong tổng số <span className="font-medium">{groupsResponse.totalElements || 0}</span> nhóm
                            </div>
                            <div className="flex space-x-2 self-center md:self-auto">
                                <button
                                    className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                                    <span className="text-orange-600 font-medium">{currentPage}</span>
                                    <span className="mx-1 text-gray-400">/</span>
                                    <span className="text-gray-600">{totalPages || 1}</span>
                                </div>
                                <button
                                    className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {showPopup && selectedGroupId && (
                <GroupDetailPopup
                    groupId={selectedGroupId}
                    onClose={closeGroupDetail}
                    onToggleBan={handleToggleBan}
                />
            )}
        </div>
    );
};

export default GroupList;
