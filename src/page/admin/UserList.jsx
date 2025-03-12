import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/AdminNavbar.jsx";
import { FaSort, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const UserList = () => {
    const navigate = useNavigate();
    const initialUsers = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@email.com`,
        stars: Math.floor(Math.random() * 1000),
        status: i % 2 === 0 ? "normal" : "ban",
    }));

    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
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

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
            <Navbar />
            <main className="flex-grow w-full p-6 mt-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-5xl mx-auto">
                    <div className="p-4 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-red-100 via-orange-50 to-yellow-50">
                            <tr>
                                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("name")}>Name <FaSort className="inline ml-1" /></th>
                                <th className="p-3 text-left hidden md:table-cell">Email</th>
                                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("stars")}>Stars <FaSort className="inline ml-1" /></th>
                                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort("status")}>Status <FaSort className="inline ml-1" /></th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-yellow-50">
                                    <td className="p-3 text-orange-600 font-bold cursor-pointer hover:underline" onClick={() => navigate(`/user/${user.id}`)}>{user.name}</td>
                                    <td className="p-3 hidden md:table-cell">{user.email}</td>
                                    <td className="p-3 text-orange-600 font-bold">{user.stars}</td>
                                    <td className="p-3">{user.status === "ban" ? <FaTimesCircle className="text-red-500 text-xl" /> : <FaCheckCircle className="text-green-500 text-xl" />}</td>
                                    <td className="p-3">
                                        <button className={`px-3 py-1 rounded-md text-white font-bold ${user.status === "ban" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>{user.status === "ban" ? "Unban" : "Ban"}</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between p-4 border-t border-gray-200">
                        <button className="bg-orange-500 px-4 py-2 rounded-md text-white" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Prev</button>
                        <span className="text-orange-700 font-bold">{currentPage} / {totalPages}</span>
                        <button className="bg-orange-500 px-4 py-2 rounded-md text-white" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
                    </div>
                </div>
            </main>
            <footer className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-4 text-white text-center">
                <p>© 2025 GoBeyond</p>
            </footer>
        </div>
    );
};

export default UserList;
