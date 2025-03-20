import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../navbar/AdminNavbar.jsx";
import { FaSort, FaCheckCircle, FaTimesCircle, FaUser, FaEnvelope, FaIdCard, FaPhone, FaBirthdayCake, FaMapMarkerAlt } from "react-icons/fa";
import {
    useGetUsersQuery,
    useBanUserMutation,
    useUnbanUserMutation,
    useSearchUsersQuery
} from "../../service/adminService.js";

const UserList = () => {
    useNavigate();
    const [currentPage, setCurrentPage] = useState(0); // API is 0-indexed
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [roleFilter, setRoleFilter] = useState("all");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const usersPerPage = 10;
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // API calls
    const {
        data: usersData,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        refetch: refetchUsers
    } = useGetUsersQuery({ page: currentPage, size: usersPerPage });

    const {
        data: searchResults,
        isLoading: isLoadingSearch,
        isError: isErrorSearch
    } = useSearchUsersQuery(debouncedSearch, { skip: !debouncedSearch });

    const [banUser] = useBanUserMutation();
    const [unbanUser] = useUnbanUserMutation();

    // Debounce search input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm.trim()) {
                setDebouncedSearch(searchTerm);
            } else {
                setDebouncedSearch("");
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Determine which data to use based on search state
    const users = debouncedSearch ? searchResults?.content || [] : usersData?.content || [];
    const totalElements = debouncedSearch ? searchResults?.totalElements || 0 : usersData?.totalElements || 0;
    const totalPages = debouncedSearch ? searchResults?.totalPages || 1 : usersData?.totalPages || 1;
    const isLoading = isLoadingUsers || isLoadingSearch;
    const isError = isErrorUsers || isErrorSearch;

    const allRoles = ["ADMIN", "USER"]; // Update based on your actual roles

    const handleSort = (key) => {
        setSortConfig((prev) => {
            const existingSort = prev.find((s) => s.key === key);
            if (existingSort) {
                return prev.map(s => s.key === key ? { ...s, direction: s.direction === "asc" ? "desc" : "asc" } : s);
            } else {
                return [...prev, { key, direction: "asc" }];
            }
        });
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            if (currentStatus.toLowerCase() === "active") {
                await banUser({ id: userId });
            } else {
                await unbanUser({ id: userId });
            }
            refetchUsers();
        } catch (error) {
            console.error("Error toggling user status:", error);
        }
    };

    const openUserDetail = (user) => {
        setSelectedUser({...user});
        setShowPopup(true);
    };

    const closeUserDetail = () => {
        setShowPopup(false);
    };

    const filteredUsers = users.filter(user => {
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesRole;
    });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        for (const { key, direction } of sortConfig) {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const saveUserChanges = async (updatedUser) => {
        // Here you would typically have an API call to update the user
        // For now, we'll just refetch the users to get the latest data
        refetchUsers();
        setSelectedUser(updatedUser);
    };

    // Format user data for display
    const formatUserForDisplay = (user) => {
        return {
            id: user.id,
            name: user.fullName || user.username,
            username: user.username,
            email: user.email,
            phone: user.phoneNumber || "N/A",
            dob: user.dateOfBirth || "N/A",
            address: user.address || "N/A",
            role: user.roles?.includes("ADMIN") ? "Admin" : "Member",
            status: user.status ? user.status.toUpperCase() : "ACTIVE",
            avatar: user.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 70) + 1}.jpg`
        };
    };

    // Current users to display
    const currentUsers = sortedUsers.map(formatUserForDisplay);

    // Component for user detail popup with editing capabilities
    const UserDetailPopup = ({ user, onClose, onSave }) => {
        if (!user) return null;

        const [editedUser, setEditedUser] = useState({...user});
        const [isEditing, setIsEditing] = useState(false);

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setEditedUser({...editedUser, [name]: value});
        };

        const handleSave = () => {
            onSave(editedUser);
            setIsEditing(false);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
                        <div className="flex space-x-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditedUser({...user});
                                            setIsEditing(false);
                                        }}
                                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium"
                                    >
                                        Hủy
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
                                >
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 flex-shrink-0 mb-4 md:mb-0">
                                <img
                                    src={editedUser.avatar}
                                    alt={editedUser.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="md:ml-6 text-center md:text-left">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedUser.name}
                                        onChange={handleInputChange}
                                        className="text-2xl font-bold text-gray-800 border-b border-orange-300 focus:outline-none focus:border-orange-500 w-full"
                                    />
                                ) : (
                                    <h3 className="text-2xl font-bold text-gray-800">{editedUser.name}</h3>
                                )}

                                {isEditing ? (
                                    <select
                                        name="role"
                                        value={editedUser.role}
                                        onChange={handleInputChange}
                                        className="mt-2 px-3 py-1 rounded-full text-sm font-medium border border-orange-300 focus:outline-none focus:border-orange-500"
                                    >
                                        {allRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                                        editedUser.role === "Admin" ? "bg-purple-100 text-purple-800" :
                                            "bg-green-100 text-green-800"
                                    }`}>
                                        {editedUser.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaIdCard className="mr-2" />
                                    <span className="text-sm font-medium">Tên đăng nhập</span>
                                </div>
                                <div className="text-gray-800 pl-6">{editedUser.username}</div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaEnvelope className="mr-2" />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedUser.email}
                                        onChange={handleInputChange}
                                        className="text-gray-800 pl-6 border-b border-orange-300 focus:outline-none focus:border-orange-500 bg-transparent w-full"
                                    />
                                ) : (
                                    <div className="text-gray-800 pl-6">{editedUser.email}</div>
                                )}
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaPhone className="mr-2" />
                                    <span className="text-sm font-medium">Số điện thoại</span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editedUser.phone}
                                        onChange={handleInputChange}
                                        className="text-gray-800 pl-6 border-b border-orange-300 focus:outline-none focus:border-orange-500 bg-transparent w-full"
                                    />
                                ) : (
                                    <div className="text-gray-800 pl-6">{editedUser.phone}</div>
                                )}
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaBirthdayCake className="mr-2" />
                                    <span className="text-sm font-medium">Ngày sinh</span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="dob"
                                        value={editedUser.dob}
                                        onChange={handleInputChange}
                                        className="text-gray-800 pl-6 border-b border-orange-300 focus:outline-none focus:border-orange-500 bg-transparent w-full"
                                    />
                                ) : (
                                    <div className="text-gray-800 pl-6">{editedUser.dob}</div>
                                )}
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg md:col-span-2">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaMapMarkerAlt className="mr-2" />
                                    <span className="text-sm font-medium">Địa chỉ</span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address"
                                        value={editedUser.address}
                                        onChange={handleInputChange}
                                        className="text-gray-800 pl-6 border-b border-orange-300 focus:outline-none focus:border-orange-500 bg-transparent w-full"
                                    />
                                ) : (
                                    <div className="text-gray-800 pl-6">{editedUser.address}</div>
                                )}
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg md:col-span-2">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaUser className="mr-2" />
                                    <span className="text-sm font-medium">Trạng thái</span>
                                </div>
                                <div className="flex items-center pl-6">
                                    {editedUser.status === "active" ? (
                                        <FaCheckCircle className="text-green-500 mr-2" />
                                    ) : (
                                        <FaTimesCircle className="text-red-500 mr-2" />
                                    )}
                                    <span className={`font-medium ${editedUser.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                        {editedUser.status === "active" ? "Đang hoạt động" : "Đã bị khóa"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                        <button
                            onClick={async () => {
                                await toggleUserStatus(editedUser.id, editedUser.status);
                                onClose();
                            }}
                            className={`px-4 py-2 rounded-md font-medium ${
                                editedUser.status === "banned"
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                        >
                            {editedUser.status === "banned" ? "Mở khóa" : "Khóa"}
                        </button>
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
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar - Collapsible */}
                <div className={`transition-all duration-300  ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                {/* Main Content Area - Takes remaining width */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto p-4">
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                            <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                                <h1 className="text-2xl font-bold text-orange-600 mb-4">Quản lý người dùng</h1>
                                <div className="flex flex-col md:flex-row gap-3 justify-between">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm theo tên hoặc email..."
                                            className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                        <thead className="bg-gradient-to-r from-orange-100 to-yellow-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-orange-800">
                                                <button className="flex items-center" onClick={() => handleSort("name")}>
                                                    Tên
                                                    <FaSort className="ml-1 text-orange-500" />
                                                </button>
                                            </th>
                                            <th className="p-4 text-left font-bold text-orange-800 hidden md:table-cell">Email</th>
                                            <th className="p-4 text-left font-bold text-orange-800">
                                                <button className="flex items-center" onClick={() => handleSort("status")}>
                                                    Trạng thái
                                                    <FaSort className="ml-1 text-orange-500" />
                                                </button>
                                            </th>
                                            <th className="p-4 text-left font-bold text-orange-800">Thao tác</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-4 text-center text-gray-500">
                                                    Không có người dùng nào phù hợp với tìm kiếm của bạn.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentUsers.map((user) => (
                                                <tr key={user.id} className="border-b border-orange-50 hover:bg-orange-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-200">
                                                                <img
                                                                    src={user.avatar}
                                                                    alt={user.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <span
                                                                className="font-medium text-orange-600 hover:text-orange-800 cursor-pointer hover:underline"
                                                                onClick={() => openUserDetail(user)}
                                                            >
                                                                {user.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell text-gray-600">{user.email} </td>
                                                    <td className="p-4">
                                                        {user.status.toLowerCase() === "banned" ? (
                                                            <div className="flex items-center text-red-500">
                                                                <FaTimesCircle className="mr-2" />
                                                                <span className="text-sm font-medium">Đã khóa</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-green-500">
                                                                <FaCheckCircle className="mr-2" />
                                                                <span className="text-sm font-medium">Hoạt động</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="p-2 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                                                                onClick={() => openUserDetail(user)}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className={`p-2 rounded-md transition-colors ${
                                                                    user.status.toLowerCase() === "banned"
                                                                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                                        : "bg-red-100 text-red-600 hover:bg-red-200"
                                                                }`}
                                                                onClick={() => toggleUserStatus(user.id, user.status)}
                                                            >
                                                                {user.status.toLowerCase() === "banned" ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                )}
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
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-t border-orange-100 gap-4">
                                <div className="text-gray-600">
                                    Hiển thị <span className="font-medium">{currentUsers.length > 0 ? (currentPage * usersPerPage) + 1 : 0}</span> đến <span className="font-medium">{(currentPage * usersPerPage) + currentUsers.length}</span> trong tổng số <span className="font-medium">{totalElements}</span> người dùng
                                </div>
                                <div className="flex space-x-2 self-center md:self-auto">
                                    <button
                                        className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                                        disabled={currentPage === 0}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                                        <span className="text-orange-600 font-medium">{currentPage + 1}</span>
                                        <span className="mx-1 text-gray-400">/</span>
                                        <span className="text-gray-600">{totalPages}</span>
                                    </div>
                                    <button
                                        className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                                        disabled={currentPage === totalPages - 1}
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

                {/* User Detail Popup */}
                {showPopup && selectedUser && (
                    <UserDetailPopup
                        user={selectedUser}
                        onClose={closeUserDetail}
                        onSave={saveUserChanges}
                    />
                )}
            </div>
        </div>
    );
};

export default UserList;