import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/AdminNavbar.jsx";
import { FaSort, FaCheckCircle, FaTimesCircle, FaUser, FaEnvelope, FaIdCard, FaPhone, FaBirthdayCake, FaMapMarkerAlt } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";

const UserList = () => {
    const navigate = useNavigate();
    const initialUsers = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@email.com`,
        phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
        dob: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 20) + 1980}`,
        address: `${Math.floor(Math.random() * 100) + 1} Đường Nguyễn Huệ, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Challenge Host" : "Member",
        status: i % 4 === 0 ? "banned" : "active",
        avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i % 70 + 1}.jpg`
    }));

    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const usersPerPage = 10;

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

    const toggleUserStatus = (userId) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId
                    ? { ...user, status: user.status === "active" ? "banned" : "active" }
                    : user
            )
        );
    };

    const openUserDetail = (user) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    const closeUserDetail = () => {
        setShowPopup(false);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        for (const { key, direction } of sortConfig) {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    // Component for user detail popup
    const UserDetailPopup = ({ user, onClose }) => {
        if (!user) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <IoCloseCircle className="text-2xl" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center mb-6">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-200 flex-shrink-0 mb-4 md:mb-0">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="md:ml-6 text-center md:text-left">
                                <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                                    user.role === "Admin" ? "bg-purple-100 text-purple-800" :
                                        user.role === "Challenge Host" ? "bg-blue-100 text-blue-800" :
                                            "bg-green-100 text-green-800"
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaIdCard className="mr-2" />
                                    <span className="text-sm font-medium">Tên đăng nhập</span>
                                </div>
                                <div className="text-gray-800 pl-6">{user.username}</div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaEnvelope className="mr-2" />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                <div className="text-gray-800 pl-6">{user.email}</div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaPhone className="mr-2" />
                                    <span className="text-sm font-medium">Số điện thoại</span>
                                </div>
                                <div className="text-gray-800 pl-6">{user.phone}</div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaBirthdayCake className="mr-2" />
                                    <span className="text-sm font-medium">Ngày sinh</span>
                                </div>
                                <div className="text-gray-800 pl-6">{user.dob}</div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg md:col-span-2">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaMapMarkerAlt className="mr-2" />
                                    <span className="text-sm font-medium">Địa chỉ</span>
                                </div>
                                <div className="text-gray-800 pl-6">{user.address}</div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-lg md:col-span-2">
                                <div className="flex items-center mb-1 text-orange-700">
                                    <FaUser className="mr-2" />
                                    <span className="text-sm font-medium">Trạng thái</span>
                                </div>
                                <div className="flex items-center pl-6">
                                    {user.status === "active" ? (
                                        <FaCheckCircle className="text-green-500 mr-2" />
                                    ) : (
                                        <FaTimesCircle className="text-red-500 mr-2" />
                                    )}
                                    <span className={`font-medium ${user.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                        {user.status === "active" ? "Đang hoạt động" : "Đã bị khóa"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                        <button
                            onClick={() => {
                                toggleUserStatus(user.id);
                                onClose();
                            }}
                            className={`px-4 py-2 rounded-md font-medium ${
                                user.status === "banned"
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                        >
                            {user.status === "banned" ? "Mở khóa" : "Khóa"}
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
            <Navbar />
            <main className="flex-grow w-full p-4 md:p-6 mt-4 md:mt-8">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-6xl mx-auto border border-orange-100">
                    <div className="p-4 md:p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                        <h1 className="text-2xl font-bold text-orange-600 mb-4">Quản lý người dùng</h1>
                        <div className="relative">
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
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-100 to-yellow-100">
                            <tr>
                                <th className="p-4 text-left font-bold text-orange-800">
                                    <button className="flex items-center" onClick={() => handleSort("name")}>
                                        Tên
                                        <FaSort className="ml-1 text-orange-500" />
                                    </button>
                                </th>
                                <th className="p-4 text-left font-bold text-orange-800 hidden md:table-cell">Email</th>
                                <th className="p-4 text-left font-bold text-orange-800">
                                    <button className="flex items-center" onClick={() => handleSort("role")}>
                                        Vai trò
                                        <FaSort className="ml-1 text-orange-500" />
                                    </button>
                                </th>
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
                            {currentUsers.map((user) => (
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                user.role === "Admin" ? "bg-purple-100 text-purple-800" :
                                                    user.role === "Challenge Host" ? "bg-blue-100 text-blue-800" :
                                                        "bg-green-100 text-green-800"
                                            }`}>
                                                {user.role}
                                            </span>
                                    </td>
                                    <td className="p-4">
                                        {user.status === "banned" ? (
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
                                                    user.status === "banned"
                                                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                        : "bg-red-100 text-red-600 hover:bg-red-200"
                                                }`}
                                                onClick={() => toggleUserStatus(user.id)}
                                            >
                                                {user.status === "banned" ? (
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
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 flex items-center justify-between border-t border-orange-100">
                        <div className="text-gray-600">
                            Hiển thị <span className="font-medium">{indexOfFirstUser + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastUser, sortedUsers.length)}</span> trong tổng số <span className="font-medium">{sortedUsers.length}</span> người dùng
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="bg-white border border-orange-200 rounded-md px-4 py-2 flex items-center">
                                <span className="text-orange-600 font-medium">{currentPage}</span>
                                <span className="mx-1 text-gray-400">/</span>
                                <span className="text-gray-600">{totalPages}</span>
                            </div>
                            <button
                                className="p-2 rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-4 text-white text-center">
                <p>© 2025 GoBeyond</p>
            </footer>

            {/* User Detail Popup */}
            {showPopup && selectedUser && (
                <UserDetailPopup
                    user={selectedUser}
                    onClose={closeUserDetail}
                />
            )}
        </div>
    );
};

export default UserList;