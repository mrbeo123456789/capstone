import { useState, useEffect } from "react";
import Sidebar from "../../navbar/AdminNavbar.jsx";
import {
    FaSort, FaCheckCircle, FaTimesCircle, FaUser, FaEnvelope, FaIdCard, FaPhone, FaBirthdayCake, FaMapMarkerAlt
} from "react-icons/fa";
import {
    useGetUsersQuery,
    useBanUserMutation,
    useUnbanUserMutation,
    useGetUserByIdQuery
} from "../../../service/adminService.js";

const UserList = () => {
    // State quản lý trang, tìm kiếm, sắp xếp, …
    const [currentPage, setCurrentPage] = useState(0); // API 0-indexed
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [roleFilter, setRoleFilter] = useState("all");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const usersPerPage = 10;
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce cho tìm kiếm (500ms)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Dùng 1 endpoint duy nhất, truyền keyword nếu có
    const {
        data: usersData,
        isLoading,
        isError,
        refetch: refetchUsers
    } = useGetUsersQuery({ page: currentPage, size: usersPerPage, keyword: debouncedSearch });

    const [banUser] = useBanUserMutation();
    const [unbanUser] = useUnbanUserMutation();

    // Xử lý dữ liệu trả về từ API
    const users = usersData?.content || [];
    const totalElements = usersData?.totalElements || 0;
    const totalPages = usersData?.totalPages || 1;

    // Hàm xử lý sắp xếp theo key
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
        setSelectedUserId(user.id);
        setShowPopup(true);
    };

    const closeUserDetail = () => {
        setShowPopup(false);
        setSelectedUserId(null);
    };

    // Lọc theo role nếu cần (client-side)
    const filteredUsers = users.filter(user => {
        return roleFilter === "all" || user.role === roleFilter;
    });

    // Sắp xếp dữ liệu theo các tiêu chí đã chọn
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        for (const { key, direction } of sortConfig) {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    // Format dữ liệu cho hiển thị (sửa avatar, tên, …)
    const formatUserForDisplay = (user) => {
        return {
            id: user.id,
            name: user.username,
            email: user.email,
            phone: user.phone || "N/A",
            dob: user.dateOfBirth || "N/A",
            address: user.address || "N/A",
            role: user.role?.includes("ADMIN") ? "Admin" : "Member",
            status: user.status ? user.status.toUpperCase() : "ACTIVE",
            avatar: user.avatar || "/assets/default-avatar.png"
        };
    };

    const currentUsers = sortedUsers.map(formatUserForDisplay);

    // Component Popup hiển thị chi tiết người dùng
    const UserDetailPopup = ({ userId, onClose, onToggleStatus }) => {
        const { data: userDetail, isLoading: isLoadingDetail, isError: isErrorDetail } = useGetUserByIdQuery(userId);
        const [userData, setUserData] = useState(null);

        useEffect(() => {
            if (userDetail) {
                setUserData({ ...userDetail });
            }
        }, [userDetail]);

        if (isLoadingDetail) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                        <p className="text-center text-gray-700">Loading user details...</p>
                    </div>
                </div>
            );
        }

        if (isErrorDetail || !userDetail || userData === null) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                        <p className="text-center text-red-500">Error loading user details.</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">
                            Close
                        </button>
                    </div>
                </div>
            );
        }

        const displayName = (userData.firstName || "") + (userData.lastName ? " " + userData.lastName : "");
        const finalName = displayName.trim() ? displayName : userData.username;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">User detail</h2>
                        <button
                            onClick={onClose}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium"
                        >
                            Close
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 flex-shrink-0 mb-4 md:mb-0">
                                <img
                                    src={userData.avatar}
                                    alt={finalName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="md:ml-6 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-gray-800">{userData.username}</h3>
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-green-100 text-green-800">
                                    Member
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* USERNAME */}
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaIdCard className="mr-2" />
                                    <span className="text-sm font-medium">Username</span>
                                </div>
                                <div className="text-gray-800 pl-6">{userData.username}</div>
                            </div>
                            {/* EMAIL */}
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaEnvelope className="mr-2" />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                <div className="text-gray-800 pl-6">{userData.email}</div>
                            </div>
                            {/* PHONE */}
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaPhone className="mr-2" />
                                    <span className="text-sm font-medium">Phone</span>
                                </div>
                                <div className="text-gray-800 pl-6">{userData.phone}</div>
                            </div>
                            {/* DOB */}
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaBirthdayCake className="mr-2" />
                                    <span className="text-sm font-medium">Date of birth</span>
                                </div>
                                <div className="text-gray-800 pl-6">{userData.dateOfBirth || "N/A"}</div>
                            </div>
                            {/* ADDRESS */}
                            <div className="bg-orange-50 p-3 rounded-lg md:col-span-2">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaMapMarkerAlt className="mr-2" />
                                    <span className="text-sm font-medium">Address</span>
                                </div>
                                <div className="text-gray-800 pl-6">{userData.address || "N/A"}</div>
                            </div>
                            {/* STATUS */}
                            <div className="bg-orange-50 p-3 rounded-lg md:col-span-2">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaUser className="mr-2" />
                                    <span className="text-sm font-medium">Status</span>
                                </div>
                                <div className="flex items-center pl-6">
                                    {userData.status?.toLowerCase() === "active" ? (
                                        <FaCheckCircle className="text-green-500 mr-2" />
                                    ) : (
                                        <FaTimesCircle className="text-red-500 mr-2" />
                                    )}
                                    <span className={`font-medium ${userData.status?.toLowerCase() === "active" ? "text-green-600" : "text-red-600"}`}>
                                        {userData.status?.toLowerCase() === "active" ? "active" : "inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer với toggle trạng thái và nút Đóng */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end items-center border-t border-gray-200 space-x-3">
                        <label htmlFor="toggleSwitch" className="relative inline-block w-12 h-6">
                            <input
                                id="toggleSwitch"
                                type="checkbox"
                                className="opacity-0 w-0 h-0"
                                checked={userData.status?.toLowerCase() === "active"}
                                onChange={() => onToggleStatus(userId, userData.status)}
                            />
                            <span
                                className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${userData.status?.toLowerCase() === "active" ? "bg-red-500" : "bg-green-500"}`}
                            ></span>
                            <span
                                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${userData.status?.toLowerCase() === "active" ? "translate-x-6" : "translate-x-0"}`}
                            ></span>
                        </label>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
            <div className="flex flex-1 overflow-hidden relative">
                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
                    <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto p-4">
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-orange-100 h-full flex flex-col">
                            <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                                <h1 className="text-2xl font-bold text-orange-600 mb-4">User Management</h1>
                                <div className="flex flex-col md:flex-row gap-3 justify-between">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm theo tên hoặc email..."
                                            className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(0); // reset trang khi có tìm kiếm mới
                                            }}
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
                                        <p>Error fetching data. Please try again</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-orange-100 to-yellow-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="p-4 text-left font-bold text-orange-800">
                                                <button className="flex items-center" onClick={() => handleSort("username")}>
                                                    Username
                                                    <FaSort className="ml-1 text-orange-500" />
                                                </button>
                                            </th>
                                            <th className="p-4 text-left font-bold text-orange-800 hidden md:table-cell">Email</th>
                                            <th className="p-4 text-left font-bold text-orange-800">
                                                <button className="flex items-center" onClick={() => handleSort("status")}>
                                                    Status
                                                    <FaSort className="ml-1 text-orange-500" />
                                                </button>
                                            </th>
                                            <th className="p-4 text-left font-bold text-orange-800">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-4 text-center text-gray-500">
                                                    Don't have any user match with your looking for
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
                                                    <td className="p-4 hidden md:table-cell text-gray-600">{user.email}</td>
                                                    <td className="p-4">
                                                        {user.status.toLowerCase() === "banned" ? (
                                                            <div className="flex items-center text-red-500">
                                                                <FaTimesCircle className="mr-2" />
                                                                <span className="text-sm font-medium">inactive</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-green-500">
                                                                <FaCheckCircle className="mr-2" />
                                                                <span className="text-sm font-medium">active</span>
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
                                    Display{" "}
                                    <span className="font-medium">
                                        {currentUsers.length > 0 ? (currentPage * usersPerPage) + 1 : 0}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                        {(currentPage * usersPerPage) + currentUsers.length}
                                    </span>{" "}
                                    in total{" "}
                                    <span className="font-medium">{totalElements}</span> users
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
                {showPopup && selectedUserId && (
                    <UserDetailPopup
                        userId={selectedUserId}
                        onClose={closeUserDetail}
                        onToggleStatus={toggleUserStatus}
                    />
                )}
            </div>
        </div>
    );
};

export default UserList;
