import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/AdminNavbar.jsx";
import { FaSort, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const UserList = () => {
    const navigate = useNavigate();

    // 🧑‍💼 Sample User Data
    const initialUsers = [
        { id: 1, name: "Giacomo Guilizzoni", email: "abc@gmail.com", stars: 730, status: "normal" },
        { id: 2, name: "Marco Botton", email: "aks@gmail.com", stars: 350, status: "ban" },
        { id: 3, name: "Mariah Maclachlan", email: "kahsnie@email.com", stars: 300, status: "normal" },
        { id: 4, name: "John Doe", email: "johndoe@gmail.com", stars: 420, status: "ban" },
        { id: 5, name: "Jane Smith", email: "janesmith@gmail.com", stars: 500, status: "normal" },
        { id: 6, name: "Alice Johnson", email: "alice@gmail.com", stars: 410, status: "ban" },
        { id: 7, name: "Bob Williams", email: "bob@gmail.com", stars: 330, status: "normal" },
        { id: 8, name: "Charlie Brown", email: "charlie@gmail.com", stars: 275, status: "ban" },
        { id: 9, name: "David Wilson", email: "david@gmail.com", stars: 600, status: "normal" },
        { id: 10, name: "Emma Thomas", email: "emma@gmail.com", stars: 450, status: "ban" },
        { id: 11, name: "Sophia Miller", email: "sophia@gmail.com", stars: 390, status: "normal" },
        { id: 12, name: "Liam Davis", email: "liam@gmail.com", stars: 720, status: "ban" }
    ];

    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // 🔄 Handle Ban/Unban Action
    const toggleBanStatus = (id) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, status: user.status === "ban" ? "normal" : "ban" } : user
        ));
    };

    // 📌 Multi-Column Sorting Function
    const handleSort = (key) => {
        setSortConfig((prev) => {
            const existingSort = prev.find((s) => s.key === key);
            if (existingSort) {
                // Toggle between asc, desc, and remove sorting
                if (existingSort.direction === "asc") {
                    return prev.map(s => s.key === key ? { ...s, direction: "desc" } : s);
                } else {
                    return prev.filter(s => s.key !== key);
                }
            } else {
                return [...prev, { key, direction: "asc" }];
            }
        });
    };

    // 🔍 Search & Filter Users
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 📌 Apply Multi-Column Sorting
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        for (const { key, direction } of sortConfig) {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    // 📌 Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    return (
        <div className="bg-gray-900 min-h-screen">
            {/* Navbar Component */}
            <Navbar />

            <div className="p-6 pt-20">
                {/* 🔍 Search Input */}
                <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md">
                    <h2 className="text-yellow-400 font-bold text-xl">User Management</h2>
                    <input
                        type="text"
                        placeholder="🔍 Search..."
                        className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 📊 User Table */}
                <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-center text-gray-300">
                        <thead className="bg-gray-700">
                        <tr>
                            <th className="p-3 text-white cursor-pointer" onClick={() => handleSort("name")}>
                                Name <FaSort className="inline ml-1" />
                            </th>
                            <th className="p-3 text-white cursor-pointer" onClick={() => handleSort("email")}>
                                Email <FaSort className="inline ml-1" />
                            </th>
                            <th className="p-3 text-white cursor-pointer" onClick={() => handleSort("stars")}>
                                Stars <FaSort className="inline ml-1" />
                            </th>
                            <th className="p-3 text-white cursor-pointer" onClick={() => handleSort("status")}>
                                Status <FaSort className="inline ml-1" />
                            </th>
                            <th className="p-3 text-white">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentUsers.map((user) => (
                            <tr key={user.id} className="border-b border-gray-700">
                                <td
                                    className="p-3 text-yellow-300 font-bold cursor-pointer hover:underline"
                                    onClick={() => navigate(`/user/${user.id}`)}
                                >
                                    {user.name}
                                </td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3 text-yellow-400 font-bold">{user.stars}</td>
                                <td className="p-3">
                                    {user.status === "ban" ? (
                                        <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                                    ) : (
                                        <FaCheckCircle className="text-green-400 text-xl mx-auto" />
                                    )}
                                </td>
                                <td className="p-3">
                                    <button
                                        className={`px-4 py-2 rounded-md text-white font-bold ${
                                            user.status === "ban" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                        }`}
                                        onClick={() => toggleBanStatus(user.id)}
                                    >
                                        {user.status === "ban" ? "Unban" : "Ban"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* 📌 Pagination Controls */}
                <div className="flex justify-center mt-6 space-x-3">
                    <button className="bg-red-500 px-4 py-2 rounded-md text-white" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
                    <span className="text-yellow-300 font-bold text-lg">{currentPage} / {totalPages}</span>
                    <button className="bg-red-500 px-4 py-2 rounded-md text-white" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default UserList;
